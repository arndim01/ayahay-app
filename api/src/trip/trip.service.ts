import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, PrismaClient, Trip } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { IAccount, IPort, ITrip, IShip } from '@ayahay/models';
import { TripMapper } from './trip.mapper';
import { isEmpty } from 'lodash';
import {
  AvailableTrips,
  CancelledTrips,
  CollectOption,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  SearchAvailableTrips,
  SearchAvailableTripsV2,
  UpdateTripCapacityRequest,
  VehicleBookings,
} from '@ayahay/http';
import { TripValidator } from './trip.validator';
import { ShippingLineService } from '@/shipping-line/shipping-line.service';
import { ShipService } from '@/ship/ship.service';
import { UtilityService } from '@/utility.service';
import { EmailService } from '@/email/email.service';
import { BookingMapper } from '@/booking/booking.mapper';
import { AuthService } from '@/auth/auth.service';
import { CabinService } from '@/cabin/cabin.service';

const TRIP_AVAILABLE_QUERY_SELECT = Prisma.sql`
  SELECT 
    t.id, 
    MAX(t.departure_date) AS "departureDate",
    t.reference_number AS "referenceNo",
    t.ship_id AS "shipId",
    t.shipping_line_id AS "shippingLineId",
    t.src_port_id AS "srcPortId",
    t.dest_port_id AS "destPortId",
    t.status AS "status",
    t.allow_online_booking AS "allowOnlineBooking",
    t.seat_selection AS "seatSelection",
    t.available_vehicle_capacity AS "availableVehicleCapacity",
    t.vehicle_capacity AS "vehicleCapacity",
    t.booking_start_date AS "bookingStartDate",
    t.booking_cut_off_date AS "bookingCutOffDate",
    COALESCE(slr.estimated_time_arrival, 120) as "estimated_time_arrival",
    COALESCE(t.departure_date + (COALESCE(slr.estimated_time_arrival, 120) * INTERVAL '1 minute'), t.departure_date + INTERVAL '120 minutes') AS "arrival_time",
    STRING_AGG(DISTINCT tc.cabin_id::TEXT, '|') AS "pipeSeparatedCabinIds",
    STRING_AGG(rtr.fare::TEXT, '|') AS "pipeSeparatedCabinFares",
    STRING_AGG(DISTINCT tc.available_passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinAvailableCapacities",
    STRING_AGG(DISTINCT tc.passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinCapacities",
    STRING_AGG(DISTINCT c.cabin_type_id::TEXT, '|') AS "pipeSeparatedCabinTypeIds",
    STRING_AGG(DISTINCT c.name::TEXT, '|') AS "pipeSeparatedCabinNames",
    STRING_AGG(DISTINCT c.recommended_passenger_capacity::TEXT, '|') AS "pipeSeparatedRecommendedCabinCapacities",
    STRING_AGG(DISTINCT ct.name::TEXT, '|') AS "pipeSeparatedCabinTypeNames",
    STRING_AGG(DISTINCT ct.description::TEXT, '|') AS "pipeSeparatedCabinTypeDescriptions"
`;

const TRIP_AVAILABLE_QUERY_FROM = Prisma.sql`
  FROM ayahay.trip t
    INNER JOIN ayahay.trip_cabin tc ON t.id = tc.trip_id
    INNER JOIN ayahay.cabin c ON tc.cabin_id = c.id
    INNER JOIN ayahay.cabin_type ct ON c.cabin_type_id = ct.id
    INNER JOIN ayahay.rate_table_row rtr ON t.rate_table_id = rtr.rate_table_id AND tc.cabin_id = rtr.cabin_id
    LEFT JOIN ayahay.shipping_line_route slr ON t.src_port_id = slr.src_port_id 
        AND t.dest_port_id = slr.dest_port_id 
        AND (t.ship_id = slr.ship_id OR slr.ship_id IS NULL)
    `;

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingLineService: ShippingLineService,
    private readonly shipService: ShipService,
    private readonly emailService: EmailService,
    private readonly utilityService: UtilityService,
    private readonly authService: AuthService,
    private readonly cabinService: CabinService,
    private readonly tripMapper: TripMapper,
    private readonly bookingMapper: BookingMapper,
    private readonly tripValidator: TripValidator
  ) {}

  async getTrips(): Promise<ITrip[]> {
    const trips = await this.prisma.trip.findMany({
      include: {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        ship: {
          include: {
            cabins: {
              include: {
                cabinType: true,
              },
            },
          },
        },
      },
    });
    if (!trips) {
      throw new NotFoundException('Trip Not Found');
    }

    return trips.map((trip) => this.tripMapper.convertTripToBasicDto(trip));
  }

  async getTrip(
    loggedInAccount: IAccount,
    tripWhereUniqueInput: Prisma.TripWhereUniqueInput,
    tripIncludeInput?: Prisma.TripInclude
  ): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({
      where: tripWhereUniqueInput,
      include: tripIncludeInput,
    });

    if (!trip) {
      throw new NotFoundException('Trip Not Found');
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    return trip;
  }

  async getAvailableTrips(
    pagination: PaginatedRequest,
    searchQuery: SearchAvailableTrips,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<ITrip>> {
    const {
      srcPortId,
      destPortId,
      departureDate,
      passengerCount,
      vehicleCount,
      cabinIds,
      shippingLineId,
    } = searchQuery;

    const currentDate = new Date().toISOString();
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;
    const where = Prisma.sql`
      WHERE t.available_vehicle_capacity >= ${Number(vehicleCount)}
        AND t.departure_date > ${departureDate}::TIMESTAMP
        AND t.departure_date < '2500-01-01T16:00:00.000Z'::TIMESTAMP
        AND t.src_port_id = ${Number(srcPortId)}
        AND t.dest_port_id = ${Number(destPortId)}
        AND t.status = 'Awaiting'
        AND t.rate_table_id = rtr.rate_table_id
        AND rtr.discount_type IS NULL
        ${
          loggedInAccount === undefined || loggedInAccount.role === 'Passenger' || loggedInAccount.role === 'TravelAgencyAdmin' || loggedInAccount.role === 'TravelAgencyStaff'
            ? Prisma.sql`AND t.booking_cut_off_date > ${currentDate}::TIMESTAMP`
            : Prisma.empty
        }
        ${
          loggedInAccount &&
          (loggedInAccount.role === 'ShippingLineAdmin' ||
            loggedInAccount.role === 'SuperAdmin')
            ? Prisma.empty
            : Prisma.sql`AND t.allow_online_booking = true`
        }
        ${
          isNaN(shippingLineId)
            ? Prisma.empty
            : Prisma.sql`AND t.shipping_line_id = ${Number(shippingLineId)}`
        }
        ${
          isEmpty(cabinIds)
            ? Prisma.empty
            : Prisma.sql`AND c.cabin_type_id IN (${Prisma.join(
                cabinIds.split(',').map((id) => Number(id))
              )})`
        }
    `;

    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      ${TRIP_AVAILABLE_QUERY_SELECT}
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
      GROUP BY t.id, slr.estimated_time_arrival
      HAVING SUM(tc.available_passenger_capacity) >= ${Number(passengerCount)}
      ORDER BY t.departure_date ASC
      OFFSET ${skip}
      LIMIT ${itemsPerPage};
    `;

    const tripsCount = await this.prisma.$queryRaw<number>`
      SELECT 
        COUNT(DISTINCT t.id)::integer
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
    `;

    return {
      total: tripsCount[0].count,
      data: trips.map((trip) =>
        this.tripMapper.convertAvailableTripsToDto(trip)
      ),
    };
  }

  async getAvailableTripsV2(
    pagination: PaginatedRequest,
    searchQuery: SearchAvailableTripsV2,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<ITrip>> {
    const {
      srcPortId,
      destPortId,
      departureDate,
      passengerCount,
      vehicleCount,
      cabinIds,
      cabinTypes,
      shippingLineId,
      shippingLineIds,
      sort,
      filterSpecificDate,
      filterDepartureDateTime,
    } = searchQuery;

    const currentDate = new Date().toISOString();
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where = Prisma.sql`
      WHERE t.available_vehicle_capacity >= ${Number(vehicleCount)}
        AND t.departure_date > ${departureDate}::TIMESTAMP
        AND t.departure_date < '2500-01-01T16:00:00.000Z'::TIMESTAMP
        AND t.src_port_id = ${Number(srcPortId)}
        AND t.dest_port_id = ${Number(destPortId)}
        AND t.status = 'Awaiting'
        AND t.rate_table_id = rtr.rate_table_id
        AND rtr.discount_type IS NULL
        ${
          isEmpty(filterSpecificDate)
            ? Prisma.empty
            : Prisma.sql`AND (t.departure_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila')::DATE = ${filterSpecificDate}::DATE`
        }
        ${
          isEmpty(filterDepartureDateTime)
            ? Prisma.empty
            : Prisma.sql`AND (DATE_TRUNC('minute', t.departure_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila') = DATE_TRUNC('minute', ${filterDepartureDateTime}::TIMESTAMP))`
        }
        ${
          loggedInAccount === undefined || loggedInAccount.role === 'Passenger'
            ? Prisma.sql`AND t.booking_cut_off_date > ${currentDate}::TIMESTAMP`
            : Prisma.empty
        }
        ${
          loggedInAccount &&
          (loggedInAccount.role === 'ShippingLineAdmin' ||
            loggedInAccount.role === 'SuperAdmin')
            ? Prisma.empty
            : Prisma.sql`AND t.allow_online_booking = true`
        }
        ${
          isNaN(shippingLineId)
            ? Prisma.empty
            : Prisma.sql`AND t.shipping_line_id = ${Number(shippingLineId)}`
        }
        ${
          isEmpty(cabinIds)
            ? Prisma.empty
            : Prisma.sql`AND c.cabin_type_id IN (${Prisma.join(
                cabinIds.split(',').map((id) => Number(id))
              )})`
        }
        ${
          isEmpty(shippingLineIds)
            ? Prisma.empty
            : Prisma.sql`AND t.shipping_line_id IN (${Prisma.join(
                shippingLineIds.split(',').map((id) => Number(id))
              )})`
        }
        ${
          isEmpty(cabinTypes)
            ? Prisma.empty
            : Prisma.sql`AND c.cabin_type_id IN (${Prisma.join(
                cabinTypes.split(',').map((id) => Number(id))
              )})`
        }
    `;

    const orderBy =
      sort === 'cheapest'
        ? Prisma.sql`ORDER BY MIN(rtr.fare) ASC`
        : sort === 'earliest'
        ? Prisma.sql`ORDER BY MIN(t.departure_date) ASC`
        : Prisma.sql`ORDER BY t.departure_date ASC`;

    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      ${TRIP_AVAILABLE_QUERY_SELECT}
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
      GROUP BY t.id, slr.estimated_time_arrival
      HAVING SUM(tc.available_passenger_capacity) >= ${Number(passengerCount)}
      ${orderBy}
      OFFSET ${skip}
      LIMIT ${itemsPerPage};
    `;

    const tripsCount = await this.prisma.$queryRaw<number>`
      SELECT 
        COUNT(DISTINCT t.id)::integer
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
    `;

    return {
      total: tripsCount[0].count,
      data: trips.map((trip) =>
        this.tripMapper.convertAvailableTripsToDto(trip)
      ),
    };
  }

  async getTripsByIds(tripIds: number[]): Promise<ITrip[]> {
    if (!tripIds || tripIds.length === 0 || tripIds.length > 10) {
      throw new BadRequestException();
    }
    
    const trips = await this.prisma.trip.findMany({
      where: {
        id: {
          in: tripIds,
        },
      },
      include: {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        ship: true,
        availableCabins: {
          include: {
            cabin: {
              include: {
                cabinType: true,
              },
            },
          },
        },
      },
    });
  
    // Process each trip to include arrival time information
    const enhancedTrips = await Promise.all(
      trips.map(async (trip) => {
        const tripDto = this.tripMapper.convertTripToDto(trip);
        
        try {
          if (!trip.srcPort?.id || !trip.destPort?.id) {
            return { ...tripDto, estimatedTimeArrival: null, arrivalTime: null };
          }
          
          // First try to find a route with matching ship_id
          let route = null;
          if (trip.shipId) {
            route = await this.prisma.shipping_line_route.findFirst({
              where: {
                src_port_id: trip.srcPort.id,
                dest_port_id: trip.destPort.id,
                ship_id: trip.shipId
              },
              select: { estimated_time_arrival: true }
            });
          }
          
          // If no route found with matching ship_id, try without ship_id constraint
          if (!route) {
            route = await this.prisma.shipping_line_route.findFirst({
              where: {
                src_port_id: trip.srcPort.id,
                dest_port_id: trip.destPort.id
              },
              select: { estimated_time_arrival: true }
            });
          }
          
          // If still no route found, return without arrival information
          if (!route) {
            return { ...tripDto, estimatedTimeArrival: null, arrivalTime: null };
          }
          
          // Calculate arrival time if departure date is available
          if (trip.departureDate && route.estimated_time_arrival) {
            const departureDate = new Date(trip.departureDate);
            const arrivalTime = new Date(departureDate.getTime() + route.estimated_time_arrival * 60000);
            
            return {
              ...tripDto,
              estimatedTimeArrival: route.estimated_time_arrival,
              arrivalTimeDateIso: arrivalTime.toISOString()
            };
          } else {
            // Return with estimated time but no arrival time
            return {
              ...tripDto,
              estimatedTimeArrival: route.estimated_time_arrival,
              arrivalTimeDateIso: null
            };
          }
        } catch (error) {
          // In case of any error, return trip without arrival information
          return {
            ...tripDto,
            estimatedTimeArrival: null,
            arrivalTimeDateIso: null
          };
        }
      })
    );
  
    return enhancedTrips;
  }

  async getTripsDestinationByPortId(
    portId: number,
    shippingLineId?: number
  ): Promise<IPort[]> {
    if (!portId) {
      throw new BadRequestException();
    }

    const whereCondition: any = {
      srcPortId: portId,
    };

    // Only add shippingLineId condition if it's not null, undefined, or an empty string
    if (shippingLineId) {
      whereCondition.shippingLineId = shippingLineId;
    }

    const trips = await this.prisma.shippingLineSchedule.findMany({
      where: whereCondition,
      include: {
        destPort: true,
      },
    });

    // Filter out duplicates based on the `id` of destPort
    const uniqueDestPorts = Array.from(
      new Map(trips.map((trip) => [trip.destPort.id, trip.destPort])).values()
    );

    return uniqueDestPorts;
  }

  async getScheduleAndFares(
    departureDateISO?: string,
    shippingLineId?: number,
  ): Promise<ITrip[]> {
    if (!departureDateISO) {
      throw new BadRequestException('departureDateISO is required');
    }
  
    // Check if selected date is current date
    const selectedDate = new Date(departureDateISO);
    const currentDate = new Date();
    
    // Compare year, month, and day only
    const isCurrentDate = 
      selectedDate.getFullYear() === currentDate.getFullYear() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getDate() === currentDate.getDate();
  
    if (isCurrentDate) {
      return []; // Return empty array instead of throwing error
    }
  
    const minDepartureDate = new Date(departureDateISO).toISOString();
  
    const maxDepartureDate = new Date(departureDateISO);
    maxDepartureDate.setUTCDate(maxDepartureDate.getUTCDate() + 1);
    const maxDateISO = maxDepartureDate.toISOString();
  
    const now = new Date().toISOString();
  
    const where = Prisma.sql`
      WHERE t.status = 'Awaiting'
        AND t.allow_online_booking = true
        AND t.booking_cut_off_date > ${now}::TIMESTAMP
        AND t.departure_date >= ${minDepartureDate}::TIMESTAMP
        AND t.departure_date < ${maxDateISO}::TIMESTAMP
        ${shippingLineId
          ? Prisma.sql`AND t.shipping_line_id = ${shippingLineId}`
          : Prisma.empty}
        AND t.rate_table_id = rtr.rate_table_id
        AND rtr.discount_type IS NULL
    `;
  
    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      ${TRIP_AVAILABLE_QUERY_SELECT}
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
      GROUP BY t.id, slr.estimated_time_arrival
      ORDER BY t.departure_date ASC;
    `;
  
    if (!trips.length) {
      throw new NotFoundException(
        'No schedules found for the given date and shipping line',
      );
    }
  
    return trips.map((trip) =>
      this.tripMapper.convertAvailableTripsToDto(trip)
    );
  }
  
  async getFullTripsById(tripIds: number[]): Promise<ITrip[]> {
    if (!tripIds || tripIds.length === 0 || tripIds.length > 10) {
      throw new BadRequestException();
    }
    const trips = await this.prisma.trip.findMany({
      where: {
        id: {
          in: tripIds,
        },
      },
      include: {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        availableCabins: {
          include: {
            cabin: {
              include: {
                cabinType: true,
              },
            },
          },
        },
        rateTable: {
          include: {
            rows: {
              include: {
                cabin: {
                  include: {
                    cabinType: true,
                  },
                },
                vehicleType: true,
              },
            },
            markups: true,
          },
        },
      },
    });

    return trips.map((trip) => this.tripMapper.convertFullTripToDto(trip));
  }

  async getAvailableTripsByDateRange(
    pagination: PaginatedRequest,
    shippingLineId: number,
    startDate: string,
    endDate: string,
    srcPortId?: number,
    destPortId?: number
  ): Promise<PaginatedResponse<ITrip>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;
    const where = Prisma.sql`
      WHERE t.shipping_line_id = ${Number(shippingLineId)}
      AND t.departure_date > ${startDate}::TIMESTAMP
      AND t.departure_date <= ${endDate}::TIMESTAMP
      ${
        !!srcPortId
          ? Prisma.sql`AND t.src_port_id = ${srcPortId}`
          : Prisma.empty
      }
      ${
        !!destPortId
          ? Prisma.sql`AND t.dest_port_id = ${destPortId}`
          : Prisma.empty
      }
    `;

    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      ${TRIP_AVAILABLE_QUERY_SELECT}
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
 	    GROUP BY t.id, slr.estimated_time_arrival
      ORDER BY t.departure_date ASC
      OFFSET ${skip}
      LIMIT ${itemsPerPage};
    `;

    const tripsCount = await this.prisma.$queryRaw<number>`
      SELECT 
        COUNT(DISTINCT t.id)::integer
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
    `;

    return {
      total: tripsCount[0].count,
      data: trips.map((trip) =>
        this.tripMapper.convertAvailableTripsToDto(trip)
      ),
    };
  }

  async getTripsForCollectBooking(
    { startDate, endDate, srcPortId, destPortId }: PortsAndDateRangeSearch,
    loggedInAccount: IAccount
  ): Promise<CollectOption[]> {
    const trips = await this.prisma.trip.findMany({
      where: {
        departureDate: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        shippingLineId: loggedInAccount.shippingLineId,
        srcPortId: Number(srcPortId) || undefined,
        destPortId: Number(destPortId) || undefined,
      },
      select: {
        id: true,
        srcPort: {
          select: {
            name: true,
          },
        },
        destPort: {
          select: {
            name: true,
          },
        },
        departureDate: true,
      },
      orderBy: {
        departureDate: 'asc',
      },
    });

    return this.tripMapper.convertTripToCollectOptions(trips);
  }

  async getCancelledTrips(
    pagination: PaginatedRequest,
    shippingLineId: number,
    { startDate, endDate, srcPortId, destPortId }: PortsAndDateRangeSearch,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<CancelledTrips>> {
    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      { shippingLineId },
      loggedInAccount
    );

    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.TripWhereInput = {
      shippingLineId,
      departureDate: {
        gte: new Date(startDate).toISOString(),
        lte: new Date(endDate).toISOString(),
      },
      status: 'Cancelled',
      srcPortId: Number(srcPortId) || undefined,
      destPortId: Number(destPortId) || undefined,
    };

    const cancelledTrips = await this.prisma.trip.findMany({
      where,
      select: {
        srcPort: {
          select: {
            name: true,
          },
        },
        destPort: {
          select: {
            name: true,
          },
        },
        ship: {
          select: {
            name: true,
          },
        },
        departureDate: true,
        cancellationReason: true,
      },
      take: itemsPerPage,
      skip,
    });

    const cancelledTripsCount = await this.prisma.trip.count({
      where,
    });

    return {
      total: cancelledTripsCount,
      data: cancelledTrips.map((trip) =>
        this.tripMapper.convertCancelledTripsToDto(trip)
      ),
    };
  }

  async getVehicleBookingsOfTrip(
    pagination: PaginatedRequest,
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<VehicleBookings>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const bookingIds = await this.prisma.bookingTripVehicle.findMany({
      where: {
        tripId,
        trip: {
          shippingLineId: loggedInAccount.shippingLineId,
        },
      },
      select: {
        bookingId: true,
        trip: {
          select: {
            shippingLineId: true,
          },
        },
      },
    });

    const bookingIdsStrArr = bookingIds.map(({ bookingId }) => bookingId);

    const where: Prisma.BookingWhereInput = {
      id: {
        in: bookingIdsStrArr,
      },
      bookingStatus: {
        in: ['Confirmed', 'Requested'],
      },
    };

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        bookingTripVehicles: {
          where: {
            removedReason: null,
          },
          include: {
            vehicle: {
              include: {
                vehicleType: true,
              },
            },
          },
        },
      },
      take: itemsPerPage,
      skip,
    });

    const bookingsCount = await this.prisma.booking.count({
      where,
    });

    return {
      total: bookingsCount,
      data: bookings.map((booking) =>
        this.bookingMapper.convertBookingToBookingTripVehicle(booking)
      ),
    };
  }

  async createTrip(
    data: Prisma.TripCreateInput,
    transactionContext?: PrismaClient
  ): Promise<number> {
    transactionContext ??= this.prisma;

    const { id: tripId } = await transactionContext.trip.create({
      data,
      select: { id: true },
    });

    return tripId;
  }

  async validateTripsFromSchedules(
    createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest,
    loggedInAccount: IAccount
  ): Promise<{
    valid: boolean;
    errors?: { scheduleId: number; message: string }[];
  }> {
    try {
      console.log('Validating trips from request');

      // Build trip date combinations to check for conflicts
      const tripsToCheck: {
        scheduleId: number;
        srcPortId: number;
        destPortId: number;
        shipId: number;
        departureDate: Date;
        shippingLineId?: number;
      }[] = [];

      // For each schedule and date range, generate all potential trip dates
      for (const schedule of createTripsFromSchedulesRequest.schedules) {
        // Skip if no override is provided
        if (!schedule.override) {
          return {
            valid: false,
            errors: [
              {
                scheduleId: schedule.scheduleId,
                message: `Missing override details for schedule ${schedule.scheduleId}`,
              },
            ],
          };
        }

        // Check for required fields in override
        const {
          srcPortId,
          destPortId,
          shipId,
          departureDateIso,
          shippingLineId,
        } = schedule.override;
        const missingFields = [];

        if (!srcPortId) missingFields.push('srcPortId');
        if (!destPortId) missingFields.push('destPortId');
        if (!shipId) missingFields.push('shipId');
        if (!departureDateIso) missingFields.push('departureDateIso');

        if (missingFields.length > 0) {
          return {
            valid: false,
            errors: [
              {
                scheduleId: schedule.scheduleId,
                message: `Missing required fields: ${missingFields.join(', ')}`,
              },
            ],
          };
        }

        // Make sure the user has access to the shipping line
        const effectiveShippingLineId =
          shippingLineId || loggedInAccount.shippingLineId;
        if (!effectiveShippingLineId) {
          return {
            valid: false,
            errors: [
              {
                scheduleId: schedule.scheduleId,
                message:
                  'No shipping line ID provided and user is not associated with a shipping line',
              },
            ],
          };
        }

        // Verify the user has access to this shipping line
        if (
          loggedInAccount.role !== 'SuperAdmin' &&
          loggedInAccount.shippingLineId !== effectiveShippingLineId
        ) {
          return {
            valid: false,
            errors: [
              {
                scheduleId: schedule.scheduleId,
                message: `You do not have access to shipping line ${effectiveShippingLineId}`,
              },
            ],
          };
        }

        // Parse the departure date from the override
        let baseDepartureTime: Date;
        try {
          baseDepartureTime = new Date(departureDateIso);
          if (isNaN(baseDepartureTime.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (error) {
          return {
            valid: false,
            errors: [
              {
                scheduleId: schedule.scheduleId,
                message: `Invalid departure date format: ${departureDateIso}`,
              },
            ],
          };
        }

        // Get the hour and minute from the base departure time
        const departureHour = baseDepartureTime.getHours();
        const departureMinute = baseDepartureTime.getMinutes();

        // For each date range, create trips on appropriate days
        for (const dateRange of createTripsFromSchedulesRequest.dateRanges) {
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);

          // Make sure the date range is valid
          if (endDate < startDate) {
            return {
              valid: false,
              errors: [
                {
                  scheduleId: schedule.scheduleId,
                  message: `Invalid date range: end date (${endDate
                    .toISOString()
                    .slice(0, 10)}) is before start date (${startDate
                    .toISOString()
                    .slice(0, 10)})`,
                },
              ],
            };
          }

          // Iterate through each day in the range
          for (
            let date = new Date(startDate);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            // Get day of week (0-6, where 0 is Sunday)
            const dayOfWeek = date.getDay();
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[dayOfWeek];

            // Skip if repeatDays specified and this day isn't included
            if (schedule.repeatDays?.length > 0) {
              if (!schedule.repeatDays.includes(dayName)) {
                continue;
              }
            }

            // Create a new date with the current date but departure time from schedule
            const departureDate = new Date(date);
            departureDate.setHours(departureHour, departureMinute, 0, 0);

            // Add to list of trips to check
            tripsToCheck.push({
              scheduleId: schedule.scheduleId,
              srcPortId,
              destPortId,
              shipId,
              departureDate,
              shippingLineId: effectiveShippingLineId,
            });
          }
        }
      }

      // If no trips to check, nothing to validate
      if (tripsToCheck.length === 0) {
        return {
          valid: true,
        };
      }

      // Check for conflicts with existing trips
      const errors: { scheduleId: number; message: string }[] = [];

      console.log(
        `Checking ${tripsToCheck.length} potential trips for conflicts`
      );

      // Check each trip for conflicts
      for (const tripToCheck of tripsToCheck) {
        // Find existing trips for the same ship, on the same day using raw query
        const startDate = new Date(
          new Date(tripToCheck.departureDate).setHours(0, 0, 0, 0)
        );
        const endDate = new Date(
          new Date(tripToCheck.departureDate).setHours(23, 59, 59, 999)
        );

        const existingTrips = await this.prisma.$queryRaw`
          SELECT 
            t.id,
            t.ship_id as "shipId",
            s.name as "shipName",
            t.shipping_line_id as "shippingLineId",
            sl.name as "shippingLineName",
            t.src_port_id as "srcPortId",
            sp.name as "srcPortName",
            t.dest_port_id as "destPortId",
            dp.name as "destPortName",
            t.departure_date as "departureDate",
            t.status
          FROM 
            "ayahay"."trip" t
          JOIN 
            "ayahay"."ship" s ON t.ship_id = s.id
          JOIN 
            "ayahay"."shipping_line" sl ON t.shipping_line_id = sl.id
          JOIN 
            "ayahay"."port" sp ON t.src_port_id = sp.id
          JOIN 
            "ayahay"."port" dp ON t.dest_port_id = dp.id
          WHERE 
            t.ship_id = ${tripToCheck.shipId}
            AND t.departure_date >= ${startDate}
            AND t.departure_date < ${endDate}
            AND t.status != 'Cancelled'
        `;

        // Check for conflicts - a ship can have multiple trips on the same day
        // but not on the same route at the same exact time
        for (const existingTrip of existingTrips as any[]) {
          // If it's the same ship, same route, and same exact departure time, it's a conflict
          const existingTripDate = new Date(existingTrip.departureDate);
          if (
            existingTrip.shipId === tripToCheck.shipId &&
            existingTrip.srcPortId === tripToCheck.srcPortId &&
            existingTrip.destPortId === tripToCheck.destPortId &&
            existingTripDate.getHours() ===
              tripToCheck.departureDate.getHours() &&
            existingTripDate.getMinutes() ===
              tripToCheck.departureDate.getMinutes()
          ) {
            errors.push({
              scheduleId: tripToCheck.scheduleId,
              message: `Conflict: Vessel "${
                existingTrip.shipName
              }" is already scheduled for the route ${
                existingTrip.srcPortName
              } to ${
                existingTrip.destPortName
              } at ${existingTripDate.toLocaleString()}`,
            });

            // No need to check further for this trip
            break;
          }
        }
      }

      // Return validation result
      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Error validating trips:', error);
      return {
        valid: false,
        errors: [
          {
            scheduleId: 0,
            message:
              error instanceof Error
                ? error.message
                : 'Unknown error occurred during validation',
          },
        ],
      };
    }
  }

  async createTripsFromSchedules(
    createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest,
    loggedInAccount: IAccount
  ): Promise<void> {
    try {
      console.log(
        'Service received request:',
        JSON.stringify(createTripsFromSchedulesRequest, null, 2)
      );

      // First validate the trips to ensure there are no conflicts
      const validationResult = await this.validateTripsFromSchedules(
        createTripsFromSchedulesRequest,
        loggedInAccount
      );

      if (!validationResult.valid) {
        throw new BadRequestException(
          validationResult.errors?.[0]?.message || 'Trip validation failed'
        );
      }

      // Using a longer timeout for the transaction (30 seconds instead of default 5)
      await this.prisma.$transaction(
        async (transactionContext) => {
          // For each date range and schedule, create trips
          for (const dateRange of createTripsFromSchedulesRequest.dateRanges) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);

            for (
              let date = new Date(startDate);
              date <= endDate;
              date.setDate(date.getDate() + 1)
            ) {
              for (const schedule of createTripsFromSchedulesRequest.schedules) {
                try {
                  // Skip if no override is provided
                  if (!schedule.override) {
                    console.log(
                      `Skipping schedule ${schedule.scheduleId} - no override`
                    );
                    continue;
                  }

                  // Log the complete override object
                  console.log(
                    `Schedule ${schedule.scheduleId} override:`,
                    JSON.stringify(schedule.override, null, 2)
                  );

                  // Extract required fields from override and log each one
                  const srcPortId = schedule.override.srcPortId;
                  const destPortId = schedule.override.destPortId;
                  const shipId = schedule.override.shipId;
                  const departureDateIso = schedule.override.departureDateIso;

                  // These might be undefined/null in the override object
                  const shippingLineId = schedule.override.shippingLineId;
                  const rateTableId = schedule.override.rateTableId;

                  console.log('Extracted fields:', {
                    srcPortId,
                    destPortId,
                    shipId,
                    departureDateIso,
                    shippingLineId,
                    rateTableId,
                  });

                  // Skip if missing required fields
                  if (
                    !srcPortId ||
                    !destPortId ||
                    !shipId ||
                    !departureDateIso
                  ) {
                    console.log(
                      `Skipping schedule ${schedule.scheduleId} - missing required fields`
                    );
                    continue;
                  }

                  // Get shipping line ID - either from override or from the logged in account
                  let effectiveShippingLineId = shippingLineId;
                  if (!effectiveShippingLineId) {
                    console.log(
                      'Using account shipping line ID:',
                      loggedInAccount.shippingLineId
                    );
                    effectiveShippingLineId = loggedInAccount.shippingLineId;
                    if (!effectiveShippingLineId) {
                      throw new BadRequestException(
                        `No shipping line ID provided for schedule ${schedule.scheduleId} and user doesn't have one`
                      );
                    }
                  }

                  // Get rate table ID - either from override or find a default
                  let effectiveRateTableId = rateTableId;
                  if (!effectiveRateTableId) {
                    // Try to find a rate table for this shipping line
                    console.log(
                      `Looking for rate table for shipping line ${effectiveShippingLineId}`
                    );
                    try {
                      const rateTables = await this.prisma.shippingLineSchedule.findMany({
                        where: {
                          shippingLineId: effectiveShippingLineId,
                          shipId: shipId,
                          srcPortId: srcPortId,
                          destPortId: destPortId
                        },
                        take: 1,
                      });

                      if (rateTables.length === 0) {
                        throw new BadRequestException(
                          `No rate table found for shipping line ${effectiveShippingLineId}`
                        );
                      }

                      effectiveRateTableId = rateTables[0].rateTableId;
                      console.log(
                        `Found rate table ID: ${effectiveRateTableId}`
                      );
                    } catch (error) {
                      console.error('Error finding rate table:', error);
                      throw new BadRequestException(
                        `Failed to find rate table for shipping line ${effectiveShippingLineId}: ${error.message}`
                      );
                    }
                  }

                  // Get the day of week (0-6, where 0 is Sunday)
                  const dayOfWeek = date.getDay();
                  const dayNames = [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                  ];
                  const dayName = dayNames[dayOfWeek];

                  // Skip if repeatDays specified and this day isn't included
                  if (schedule.repeatDays?.length > 0) {
                    if (!schedule.repeatDays.includes(dayName)) {
                      continue;
                    }
                  }

                  // Parse the departure date
                  const overrideDate = new Date(departureDateIso);
                  const departureTime = new Date(date);
                  departureTime.setHours(
                    overrideDate.getHours(),
                    overrideDate.getMinutes(),
                    0,
                    0
                  );

                  // Check if a trip with the same ship, route, and departure time already exists
                  const checkStartDate = new Date(
                    new Date(departureTime).setHours(0, 0, 0, 0)
                  );
                  const checkEndDate = new Date(
                    new Date(departureTime).setHours(23, 59, 59, 999)
                  );

                  const existingTrips = await transactionContext.$queryRaw`
                  SELECT 
                    t.id,
                    t.ship_id as "shipId",
                    t.src_port_id as "srcPortId",
                    t.dest_port_id as "destPortId",
                    t.departure_date as "departureDate"
                  FROM 
                    "ayahay"."trip" t
                  WHERE 
                    t.ship_id = ${shipId}
                    AND t.departure_date >= ${checkStartDate}
                    AND t.departure_date < ${checkEndDate}
                    AND t.status != 'Cancelled'
                `;

                  // Check for conflicts
                  let hasConflict = false;
                  for (const existingTrip of existingTrips as any[]) {
                    const existingTripDate = new Date(
                      existingTrip.departureDate
                    );
                    if (
                      existingTrip.shipId === shipId &&
                      existingTrip.srcPortId === srcPortId &&
                      existingTrip.destPortId === destPortId &&
                      existingTripDate.getHours() ===
                        departureTime.getHours() &&
                      existingTripDate.getMinutes() ===
                        departureTime.getMinutes()
                    ) {
                      hasConflict = true;
                      break;
                    }
                  }

                  if (hasConflict) {
                    console.log(
                      `Trip already exists for ship ${shipId} from port ${srcPortId} to port ${destPortId} on ${departureTime}`
                    );
                    continue;
                  }

                  // Generate a unique reference number for the trip
                  const tempId = Date.now();
                  const referenceNo =
                    this.utilityService.generateReferenceNo(tempId);

                  // Calculate booking start and cutoff dates based on the request or use defaults
                  const daysBeforeBookingStart = 7; // Default value

                  const bookingStartDate = new Date(departureTime);
                  bookingStartDate.setDate(
                    bookingStartDate.getDate() - daysBeforeBookingStart
                  );

                  // Get booking cutoff preference from database
                  const bookingCutOffDate = new Date(departureTime);

                  // Look up the booking cutoff preference from the database
                  const bookingCutOffPreference =
                    await this.prisma.bookingCutoff.findFirst({
                      where: {
                        shipping_line_id: effectiveShippingLineId,
                        origin: srcPortId,
                        destination: destPortId,
                      },
                    });

                  if (!bookingCutOffPreference) {
                    console.warn(
                      `No booking cutoff preference found for Shipping Line ${effectiveShippingLineId}, Origin ${srcPortId}, Destination ${destPortId}. Using default 24 hours before departure.`
                    );
                    // Default: 24 hours before departure if no preference is found
                    bookingCutOffDate.setHours(
                      bookingCutOffDate.getHours() - 24
                    );
                  } else {
                    const { cut_off_condition_type, cut_off_value } =
                      bookingCutOffPreference;

                    if (cut_off_condition_type === 'number_of_hours') {
                      // Subtract the specified number of hours
                      bookingCutOffDate.setHours(
                        bookingCutOffDate.getHours() - cut_off_value
                      );
                    } else if (cut_off_condition_type === 'fixed_hour') {
                      // Set to the specified hour on the day before departure
                      const hours = Number(cut_off_value);
                      const minutes = 0; // Default to 0 minutes

                      // Handle invalid hour values
                      if (isNaN(hours) || hours < 0 || hours > 23) {
                        console.warn(
                          `Invalid fixed hour value: ${cut_off_value}. Using default 24 hours before departure.`
                        );
                        bookingCutOffDate.setHours(
                          bookingCutOffDate.getHours() - 24
                        );
                      } else {
                        bookingCutOffDate.setDate(
                          bookingCutOffDate.getDate() - 1
                        );
                        bookingCutOffDate.setHours(hours, minutes, 0, 0);
                        console.log(
                          `Set booking cutoff to ${hours}:${minutes} on day before departure: ${bookingCutOffDate.toISOString()}`
                        );
                      }
                    } else {
                      console.warn(
                        `Unknown booking cutoff condition type: ${cut_off_condition_type}. Using default 24 hours before departure.`
                      );
                      bookingCutOffDate.setHours(
                        bookingCutOffDate.getHours() - 24
                      );
                    }
                  }

                  // Log the determined booking cutoff time
                  console.log(`Trip departure time: ${departureTime}`);
                  console.log(
                    `Final booking cutoff time for trip: ${bookingCutOffDate.toISOString()}`
                  );

                  // Get the ship details
                  console.log(`Getting ship details for ship ID: ${shipId}`);
                  const ship = await this.shipService.getShips();
                  const shipDetails = ship.find((s) => s.id === shipId);

                  if (!shipDetails) {
                    throw new BadRequestException(
                      `Ship with ID ${shipId} not found`
                    );
                  }

                  // Create the trip
                  console.log('Creating trip with data:', {
                    shipId,
                    shippingLineId: effectiveShippingLineId,
                    srcPortId,
                    destPortId,
                    departureDate: departureTime,
                    referenceNo,
                    rateTableId: effectiveRateTableId,
                  });

                  const tripData: Prisma.TripCreateInput = {
                    ship: { connect: { id: shipId } },
                    shippingLine: { connect: { id: effectiveShippingLineId } },
                    srcPort: { connect: { id: srcPortId } },
                    destPort: { connect: { id: destPortId } },
                    departureDate: departureTime.toISOString(),
                    referenceNo,
                    seatSelection: false,
                    availableVehicleCapacity:
                      shipDetails.recommendedVehicleCapacity,
                    vehicleCapacity: shipDetails.recommendedVehicleCapacity,
                    bookingStartDate,
                    bookingCutOffDate,
                    status: 'Awaiting',
                    rateTable: { connect: { id: effectiveRateTableId } },
                    allowOnlineBooking: true,
                  };

                  const createdTrip = await transactionContext.trip.create({
                    data: tripData,
                  });

                  console.log(`Created trip with ID: ${createdTrip.id}`);

                  // Create the trip cabins for this trip
                  // This is important to maintain compatibility with the original workflow
                  await this.createManyTripCabins(
                    createdTrip.id,
                    shipId,
                    transactionContext as any
                  );

                  console.log(
                    `Successfully created trip for ship ${shipId} from port ${srcPortId} to port ${destPortId} on ${departureTime}`
                  );
                } catch (error) {
                  console.error(
                    `Error creating trip for schedule ${schedule.scheduleId}:`,
                    error
                  );
                  throw error;
                }
              }
            }
          }
        },
        {
          // Increase transaction timeout to 30 seconds to handle more trips
          timeout: 30000,
        }
      );

      console.log('All trips created successfully!');
    } catch (error) {
      console.error('Error creating trips from schedules:', error);
      throw error;
    }
  }

  async updateTripCapacities(
    tripId: number,
    updateTripCapacityRequest: UpdateTripCapacityRequest,
    loggedInAccount: IAccount
  ): Promise<void> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        availableCabins: true,
      },
    });

    if (trip === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    const errors = await this.tripValidator.validateUpdateTripCapacityRequest(
      trip,
      updateTripCapacityRequest
    );

    if (errors !== undefined) {
      throw new BadRequestException(errors);
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await this.updateTripVehicleCapacity(
        trip,
        updateTripCapacityRequest.vehicleCapacity,
        transactionContext as any
      );
      await this.updateTripCabinCapacities(
        trip,
        updateTripCapacityRequest.cabinCapacities,
        transactionContext as any
      );
    });
  }

  private async updateTripVehicleCapacity(
    trip: any,
    newVehicleCapacity: number,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    if (trip.vehicleCapacity === newVehicleCapacity) {
      return;
    }

    const capacityDifference = newVehicleCapacity - trip.vehicleCapacity;

    await transactionContext.trip.update({
      where: {
        id: trip.id,
      },
      data: {
        vehicleCapacity: newVehicleCapacity,
        availableVehicleCapacity:
          trip.availableVehicleCapacity + capacityDifference,
      },
    });
  }

  private async updateTripCabinCapacities(
    trip: any,
    newCabinCapacities: { cabinId: number; passengerCapacity: number }[],
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const cabinCapacitiesToUpdate: {
      cabinId: number;
      passengerCapacity: number;
    }[] = [];

    // get cabin capacities that has changes
    for (const cabinCapacity of newCabinCapacities) {
      const { cabinId, passengerCapacity } = cabinCapacity;

      const tripCabin = trip.availableCabins.find(
        (tripCabin) => tripCabin.cabinId === Number(cabinId)
      );

      if (tripCabin.passengerCapacity !== passengerCapacity) {
        cabinCapacitiesToUpdate.push(cabinCapacity);
      }
    }

    for (const cabinCapacity of cabinCapacitiesToUpdate) {
      const { cabinId, passengerCapacity: newPassengerCapacity } =
        cabinCapacity;

      const { availablePassengerCapacity, passengerCapacity } =
        trip.availableCabins.find(
          (tripCabin) => tripCabin.cabinId === Number(cabinId)
        );

      const capacityDifference = newPassengerCapacity - passengerCapacity;

      await transactionContext.tripCabin.update({
        where: {
          tripId_cabinId: {
            tripId: trip.id,
            cabinId: Number(cabinId),
          },
        },
        data: {
          passengerCapacity: newPassengerCapacity,
          availablePassengerCapacity:
            availablePassengerCapacity + capacityDifference,
        },
      });
    }
  }

  async setTripAsArrived(
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripToUpdate = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        srcPort: true,
        destPort: true,
      },
    });

    if (tripToUpdate === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      tripToUpdate,
      loggedInAccount
    );

    if (tripToUpdate.status !== 'Awaiting') {
      throw new BadRequestException(
        'Cannot set a cancelled or arrived trip as arrived.'
      );
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await transactionContext.trip.update({
        where: {
          id: tripId,
        },
        data: {
          status: 'Arrived',
        },
      });

      await this.shipService.createVoyageForTrip(
        tripToUpdate,
        transactionContext as any
      );
    });
  }

  /**
   * remarks, cancellationType/removedReasonType, and totalPrice
   * are hardcoded since this function can only be triggered by
   * shipping line staffs and admins
   */
  async cancelTrip(
    tripId: number,
    reason: string,
    loggedInAccount: IAccount,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const tripToUpdate = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        bookingTrips: true,
      },
    });

    if (tripToUpdate === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      tripToUpdate,
      loggedInAccount
    );

    if (tripToUpdate.status !== 'Awaiting') {
      throw new BadRequestException(
        'Cannot cancel a cancelled or arrived trip'
      );
    }

    const bookingIdsToVoid = tripToUpdate.bookingTrips.map(
      ({ bookingId }) => bookingId
    );

    await transactionContext.trip.update({
      where: {
        id: tripId,
      },
      data: {
        status: 'Cancelled',
        cancellationReason: reason,
      },
    });

    if (bookingIdsToVoid.length > 0) {
      await transactionContext.booking.updateMany({
        where: {
          id: {
            in: bookingIdsToVoid,
          },
        },
        data: {
          bookingStatus: 'Cancelled',
          failureCancellationRemarks: 'Trip Cancelled',
          cancellationType: 'NoFault',
          totalPrice: 0,
        },
      });

      await transactionContext.bookingTripPassenger.updateMany({
        where: { bookingId: { in: bookingIdsToVoid } },
        data: {
          removedReason: 'Trip Cancelled',
          removedReasonType: 'NoFault',
          totalPrice: 0,
        },
      });

      await transactionContext.bookingTripVehicle.updateMany({
        where: { bookingId: { in: bookingIdsToVoid } },
        data: {
          removedReason: 'Trip Cancelled',
          removedReasonType: 'NoFault',
          totalPrice: 0,
        },
      });
    }

    this.emailService.prepareTripCancelledEmail({ tripId, reason });
  }

  async updateTripOnlineBooking(
    tripId: number,
    allowOnlineBooking: boolean,
    loggedInAccount: IAccount
  ): Promise<void> {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });

    if (trip === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    await this.prisma.trip.update({
      where: { id: tripId },
      data: { allowOnlineBooking },
    });
  }

  async updateTripVessel(
    tripId: number,
    shipId: number,
    rateTableId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    try {
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          bookingTripPassengers: {
            include: {
              booking: true,
              cabin: {
                include: {
                  cabinType: true,
                },
              },
            },
          },
          bookingTripVehicles: true,
          srcPort: true,
          destPort: true,
          ship: {
            include: {
              cabins: {
                include: {
                  cabinType: true,
                },
              },
            },
          },
        },
      });

      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      // Basic validations
      const newShip = await this.prisma.ship.findUnique({
        where: { id: shipId },
        include: {
          cabins: {
            include: {
              cabinType: true,
            },
          },
        },
      });

      if (!newShip) {
        throw new NotFoundException('Ship not found');
      }

      if (newShip.shippingLineId !== trip.shippingLineId) {
        throw new BadRequestException(
          'Ship does not belong to this shipping line'
        );
      }

      // Verify rate table
      const rateTable = await this.prisma.rateTable.findUnique({
        where: { id: rateTableId },
      });

      if (!rateTable || rateTable.shippingLineId !== trip.shippingLineId) {
        throw new BadRequestException('Invalid rate table');
      }

      // Access check
      this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
        trip,
        loggedInAccount
      );

      // Capacity validation
      const activeBookings = trip.bookingTripPassengers.filter(
        (btp) => btp.booking.bookingStatus === 'Confirmed'
      );

      const totalPassengers = activeBookings.length;
      const totalVehicles = trip.bookingTripVehicles.length;

      const newShipTotalCapacity = newShip.cabins.reduce(
        (sum, cabin) => sum + cabin.recommendedPassengerCapacity,
        0
      );

      if (totalPassengers > newShipTotalCapacity) {
        throw new BadRequestException(
          `New vessel has insufficient passenger capacity. Need: ${totalPassengers}, Available: ${newShipTotalCapacity}`
        );
      }

      if (totalVehicles > newShip.recommendedVehicleCapacity) {
        throw new BadRequestException(
          `New vessel has insufficient vehicle capacity. Need: ${totalVehicles}, Available: ${newShip.recommendedVehicleCapacity}`
        );
      }

      // Cabin type compatibility check
      const requiredCabinTypes = new Set(
        activeBookings.map((b) => b.cabin.cabinTypeId)
      );

      const availableCabinTypes = new Set(
        newShip.cabins.map((c) => c.cabinTypeId)
      );

      const missingCabinTypes = Array.from(requiredCabinTypes).filter(
        (type) => !availableCabinTypes.has(type)
      );

      if (missingCabinTypes.length > 0) {
        throw new BadRequestException(
          `New vessel missing required cabin types: ${missingCabinTypes.join(
            ', '
          )}`
        );
      }

      // Check schedule conflict
      const existingTrip = await this.prisma.trip.findFirst({
        where: {
          shipId: shipId,
          srcPortId: trip.srcPortId,
          destPortId: trip.destPortId,
          departureDate: trip.departureDate,
          status: 'Awaiting',
          id: { not: tripId },
        },
      });

      if (existingTrip) {
        throw new BadRequestException(
          'New vessel already has a scheduled trip for this route and time'
        );
      }

      // Perform update in transaction
      await this.prisma.$transaction(async (tx) => {
        // 1. Create new trip cabins first
        const tripCabinData = newShip.cabins.map((cabin) => ({
          tripId,
          cabinId: cabin.id,
          availablePassengerCapacity: cabin.recommendedPassengerCapacity,
          passengerCapacity: cabin.recommendedPassengerCapacity,
          seatPlanId: cabin.defaultSeatPlanId || null,
        }));

        // Create new cabins first so they exist for foreign key constraint
        await tx.tripCabin.createMany({
          data: tripCabinData,
        });

        // 2. Create cabin type mapping
        const cabinTypeMap = new Map(
          newShip.cabins.map((c) => [c.cabinTypeId, c])
        );

        // 3. Now safe to update passenger bookings
        for (const booking of activeBookings) {
          const oldCabinType = booking.cabin.cabinTypeId;
          const newCabin = cabinTypeMap.get(oldCabinType);

          if (!newCabin) {
            console.error('No matching cabin found:', {
              oldCabinType,
              booking,
            });
            continue; // Skip this booking if no matching cabin found
          }

          // Update the booking to point to new cabin
          await tx.bookingTripPassenger.update({
            where: {
              bookingId_tripId_passengerId: {
                bookingId: booking.bookingId,
                tripId: booking.tripId,
                passengerId: booking.passengerId,
              },
            },
            data: {
              cabinId: newCabin.id,
              seatId: null, // Reset seat assignment for new vessel
            },
          });
        }

        // 4. Only after all bookings are updated, delete old cabin mappings
        await tx.tripCabin.deleteMany({
          where: {
            tripId,
            cabinId: {
              notIn: newShip.cabins.map((c) => c.id),
            },
          },
        });

        // 5. Finally update trip record
        await tx.trip.update({
          where: { id: tripId },
          data: {
            shipId,
            rateTableId,
            availableVehicleCapacity:
              newShip.recommendedVehicleCapacity - totalVehicles,
            vehicleCapacity: newShip.recommendedVehicleCapacity,
          },
        });

        // 6. Update available capacities
        for (const cabin of newShip.cabins) {
          const bookingsForCabin = activeBookings.filter(
            (b) => b.cabin.cabinTypeId === cabin.cabinTypeId
          ).length;

          await tx.tripCabin.update({
            where: {
              tripId_cabinId: {
                tripId,
                cabinId: cabin.id,
              },
            },
            data: {
              availablePassengerCapacity:
                cabin.recommendedPassengerCapacity - bookingsForCabin,
            },
          });
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Failed to update vessel - database constraint violation'
        );
      }

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update vessel - please try again or contact support'
      );
    }
  }

  private async createManyTripCabins(
    tripId: number,
    shipId: number,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const cabins = await this.cabinService.getCabinsByShip(shipId);

    if (cabins && cabins.length > 0) {
      const tripCabinEntities: Prisma.TripCabinCreateManyInput[] = cabins.map(
        (cabin) => ({
          tripId,
          cabinId: cabin.id,
          seatPlanId: cabin.defaultSeatPlanId || null,
          availablePassengerCapacity: cabin.recommendedPassengerCapacity,
          passengerCapacity: cabin.recommendedPassengerCapacity,
        })
      );

      await transactionContext.tripCabin.createMany({
        data: tripCabinEntities,
      });

      console.log(
        `Created ${tripCabinEntities.length} trip cabins for trip ID: ${tripId}`
      );
    } else {
      console.warn(
        `No cabins found for ship ID: ${shipId}, trip ID: ${tripId}`
      );
    }
  }

  async getTripShip(shipId: number, shippingLineId: number): Promise<IShip> {
    const ship = await this.prisma.$queryRaw<IShip[]>`
      SELECT 
        s.id,
        c.name,
        s.shipping_line_id as "shippingLineId",
        s.recommended_vehicle_capacity as "recommendedVehicleCapacity",
        c.recommended_passenger_capacity as "recommendedPassengerCapacity",
        s.recommended_vehicle_capacity as "vehicleCapacity", -- Added this field
        json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'shipId', c.ship_id,
            'recommendedPassengerCapacity', c.recommended_passenger_capacity,
            'vehicleCapacity', s.recommended_vehicle_capacity, -- Added to json
            'cabinTypeId', c.cabin_type_id,
            'cabinType', json_build_object(
              'id', ct.id,
              'name', ct.name,
              'description', ct.description,
              'shippingLineId', ct.shipping_line_id
            )
          )
        ) as cabins
      FROM ayahay.ship s
      INNER JOIN ayahay.cabin c ON c.ship_id = s.id
      LEFT JOIN ayahay.cabin_type ct ON ct.id = c.cabin_type_id
      WHERE s.id = ${shipId}
      AND s.shipping_line_id = ${shippingLineId}
      GROUP BY s.id, c.name, c.recommended_passenger_capacity;
    `;

    if (!ship || ship.length === 0) {
      throw new NotFoundException(`Ship with ID ${shipId} not found`);
    }

    return ship[0];
  }

  async getRateTableForShip(shipId: number) {
    // Find the latest trip for this ship and get its rate table
    const trip = await this.prisma.trip.findFirst({
      where: {
        shipId: shipId,
        status: 'Awaiting',
      },
      orderBy: {
        departureDate: 'desc', // Get the most recent trip
      },
      select: {
        rateTable: true,
      },
    });

    if (!trip?.rateTable) {
      throw new NotFoundException(
        `No active rate table found for ship ${shipId}`
      );
    }

    return trip.rateTable;
  }
}
