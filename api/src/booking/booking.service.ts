import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { IBooking, IAccount, IBookingTrip } from '@ayahay/models';
import {
  PaginatedRequest,
  PaginatedResponse,
  TripSearchByDateRange,
} from '@ayahay/http';
import { TripService } from '@/trip/trip.service';
import { BookingMapper } from './booking.mapper';
import { BookingValidator } from './booking.validator';
import { BookingReservationService } from './booking-reservation.service';
import { BookingPricingService } from './booking-pricing.service';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';
import { AuthService } from '@/auth/auth.service';
import { BookingVehicleService } from './booking-vehicle.service';
import { BookingPassengerService } from './booking-passenger.service';
import { ReceiptService } from '@/receipt/receipt.service';
import { ReceiptMapper } from '@/receipt/receipt.mapper';
import { EmailQueueService } from '@/email/email-queue.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tripService: TripService,
    private readonly bookingReservationService: BookingReservationService,
    private readonly bookingPricingService: BookingPricingService,
    private readonly bookingPassengerService: BookingPassengerService,
    private readonly bookingVehicleService: BookingVehicleService,
    private readonly authService: AuthService,
    private readonly bookingMapper: BookingMapper,
    private readonly receiptServer: ReceiptService,
    private readonly receiptMapper: ReceiptMapper,
    private readonly emailQueueService: EmailQueueService,
    private readonly bookingValidator: BookingValidator
  ) {}

  async getMyBookings(
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<IBooking>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const myBookingEntities = await this.prisma.booking.findMany({
      where: {
        createdByAccountId: loggedInAccount.id,
      },
      include: {
        bookingTrips: {
          include: {
            bookingTripPassengers: true,
            trip: {
              include: {
                srcPort: true,
                destPort: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: itemsPerPage,
      skip,
    });

    const myBookingsCount = await this.prisma.booking.count({
      where: {
        createdByAccountId: loggedInAccount.id,
      },
    });
    const bookings = myBookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );

    return {
      total: myBookingsCount,
      data: bookings,
    };
  }

  async getPublicBookings(bookingIds: string[]): Promise<IBooking[]> {
    const publicBookingEntities = await this.prisma.booking.findMany({
      where: {
        createdByAccountId: null,
        id: {
          in: bookingIds,
        },
      },
      include: {
        bookingTrips: {
          include: {
            trip: {
              include: {
                srcPort: true,
                destPort: true,
              },
            },
            bookingTripPassengers: true,
          },
        },
      },
    });

    return publicBookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );
  }

  async getBookingPassengersToDownload(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<IBooking[]> {
    const bookingEntities = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        bookingStatus: 'Confirmed',
        shippingLineId: loggedInAccount.shippingLineId,
      },
      include: {
        createdByAccount: true,
        bookingTrips: {
          include: {
            trip: {
              include: {
                shippingLine: true,
                srcPort: true,
                destPort: true,
              },
            },
            bookingTripPassengers: {
              include: {
                passenger: true,
              },
            },
          },
        },
        bookingPaymentItems: true,
      },
    });

    return bookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );
  }

  async getBookingVehiclesToDownload(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<IBooking[]> {
    const bookingEntities = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        bookingStatus: 'Confirmed',
        shippingLineId: loggedInAccount.shippingLineId,
      },
      include: {
        createdByAccount: true,
        bookingTrips: {
          include: {
            trip: {
              include: {
                shippingLine: true,
                srcPort: true,
                destPort: true,
              },
            },
            bookingTripVehicles: {
              include: {
                vehicle: {
                  include: {
                    vehicleType: true,
                  },
                },
                bookingPaymentItems: true,
              },
            },
          },
        },
        bookingPaymentItems: true,
      },
    });

    return bookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );
  }

  async getBookingById(
    id: string,
    loggedInAccount?: IAccount
  ): Promise<IBooking> {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id,
      },
      include: {
        shippingLine: true,
        createdByAccount: {
          include: {
            shippingLine: true,
            travelAgency: true,
            client: true,
          },
        },
        bookingTrips: {
          include: {
            trip: {
              include: {
                shippingLine: true,
                srcPort: true,
                destPort: true,
              },
            },
            bookingTripPassengers: {
              include: {
                passenger: true,
                cabin: {
                  include: {
                    cabinType: true,
                  },
                },
                seat: {
                  include: {
                    seatType: true,
                  },
                },
                bookingPaymentItems: true,
              },
              where: {
                removedReason: null,
              },
            },
            bookingTripVehicles: {
              include: {
                vehicle: {
                  include: {
                    vehicleType: true,
                  },
                },
                bookingPaymentItems: true,
              },
              where: {
                removedReason: null,
              },
            },
          },
          where: {
            OR: [
              {
                bookingTripPassengers: {
                  some: {
                    removedReason: null,
                  },
                },
              },
              {
                bookingTripVehicles: {
                  some: {
                    removedReason: null,
                  },
                },
              },
            ],
          },
        },
        bookingPaymentItems: {
          where: {
            tripId: null,
          },
        },
      },
    });

    if (booking === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.verifyLoggedInUserHasAccessToBooking(
      loggedInAccount,
      booking
    );

    booking.bookingTrips.sort(
      (bookingTripA, bookingTripB) =>
        bookingTripA.trip.departureDate.getTime() -
        bookingTripB.trip.departureDate.getTime()
    );

    return this.bookingMapper.convertBookingToSummary(booking);
  }

  async createTentativeBooking(
    booking: IBooking,
    loggedInAccount?: IAccount
  ): Promise<IBooking | undefined> {
    if (booking.bookingTrips === undefined) {
      throw new BadRequestException('A booking must have at least one trip.');
    }
    const tripIds = booking.bookingTrips.map(
      (bookingTrip) => bookingTrip.tripId
    );
    const trips = await this.tripService.getFullTripsById(tripIds);

    booking.bookingTrips.forEach(
      (bookingTrip) =>
        (bookingTrip.trip = trips.find(
          (trip) => trip.id === bookingTrip.tripId
        ))
    );

    if (booking.voucherCode?.length > 0) {
      booking.voucher = (await this.prisma.voucher.findUnique({
        where: {
          code: booking.voucherCode,
        },
      })) as any;
    } else {
      booking.voucherCode = undefined;
    }

    const errorMessages =
      await this.bookingValidator.validateCreateTentativeBookingRequest(
        booking,
        loggedInAccount
      );

    if (errorMessages.length > 0) {
      throw new BadRequestException(errorMessages);
    }

    await this.bookingReservationService.assignCabinsAndSeatsToPassengers(
      booking.bookingTrips
    );
    await this.assignDiscountTypeToPassengers(booking.bookingTrips);
    await this.bookingPricingService.assignBookingPricing(
      booking,
      loggedInAccount
    );
    await this.attachPassengersAndVehiclesToAccount(
      booking.bookingTrips,
      loggedInAccount
    );

    booking.shippingLineId = trips[0].shippingLineId;
    booking.createdByAccountId = loggedInAccount?.id;
    booking.createdAtIso = new Date().toISOString();
    booking.isBookingRequest = false;

    if (this.authService.hasPrivilegedAccess(loggedInAccount)) {
      // don't save email/mobile if staff/admin
      booking.contactEmail = booking.contactMobile = undefined;
    } else if (loggedInAccount !== undefined) {
      // override email with booking creator's email
      booking.contactEmail = loggedInAccount.email;
    }

    return await this.saveTempBooking(booking);
  }

  private assignDiscountTypeToPassengers(bookingTrips: IBookingTrip[]) {
    bookingTrips.forEach((bookingTrip) => {
      bookingTrip.bookingTripPassengers
        .filter(
          (bookingTripPassenger) =>
            bookingTripPassenger.discountType === undefined
        )
        .forEach((bookingTripPassenger) => {
          if (bookingTripPassenger.drivesVehicleId !== undefined) {
            bookingTripPassenger.discountType = 'Driver';
          } else if (
            bookingTripPassenger.passenger?.discountType !== undefined
          ) {
            // e.g. booking will inherit passenger's discount type (if applicable)
            bookingTripPassenger.discountType =
              bookingTripPassenger.passenger.discountType;
          }
        });
    });
  }

  // NOTE: mutates the booking
  private attachPassengersAndVehiclesToAccount(
    bookingTrips: IBookingTrip[],
    loggedInAccount?: IAccount
  ): void {
    if (loggedInAccount?.role !== 'Passenger') {
      return;
    }

    bookingTrips.forEach((bookingTrip) => {
      bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
        if (!(bookingTripPassenger.passenger.id > 0)) {
          bookingTripPassenger.passenger.buddyId = loggedInAccount.passengerId;
        }
      });
      bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
        if (!(bookingTripVehicle.vehicle.id > 0)) {
          bookingTripVehicle.vehicle.accountId = loggedInAccount.id;
        }
      });
    });
  }

  private async saveTempBooking(booking: IBooking): Promise<IBooking> {
    const tempBookingToCreate = JSON.parse(JSON.stringify(booking));
    this.pruneTempBooking(tempBookingToCreate);

    const tempBooking = await this.prisma.tempBooking.create(
      this.bookingMapper.convertBookingToTempBookingEntityForCreation(
        tempBookingToCreate
      )
    );

    booking.id = tempBooking.id.toString();
    return booking;
  }

  /**
   * Compresses the booking JSON fields for
   * storage efficiency
   * @param booking
   * @private
   */
  private pruneTempBooking(booking: IBooking): void {
    // don't save bookingTrip.trip in JSON
    booking.bookingTrips.forEach((bookingTrip) => {
      bookingTrip.trip.rateTable = undefined;
      bookingTrip.trip.availableCabins = undefined;
      bookingTrip.trip.availableSeatTypes = undefined;

      bookingTrip.bookingTripPassengers?.forEach((bookingTripPassenger) => {
        bookingTripPassenger.cabin = undefined;
        bookingTripPassenger.tripCabin = undefined;
      });

      bookingTrip.bookingTripVehicles
        ?.filter(({ vehicle }) => vehicle)
        ?.forEach((bookingTripVehicle) => {
          bookingTripVehicle.vehicle.vehicleType = undefined;
        });
    });
  }

  // saves actual booking data; called after payment
  async createConfirmedBookingFromPaymentReference(
    paymentReference: string,
    paymentStatus: 'Pending' | 'Success',
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const tempBooking = await transactionContext.tempBooking.findFirst({
      where: {
        paymentReference,
      },
      include: {
        createdByAccount: {
          select: {
            email: true,
            emailConsent: true,
          },
        },
      },
    });

    if (tempBooking === null) {
      throw new BadRequestException(
        'The booking session with the specified payment reference cannot be found.'
      );
    }

    const receiptBooking = await this.receiptServer.getBookingDetails(tempBooking.id, paymentReference);
    // Convert bodyDetails and attachments to JSON-compatible objects
    const bodyDetails = JSON.parse(JSON.stringify(receiptBooking.receipt)); // Ensure JSON format
    const attachmentDetails = JSON.parse(JSON.stringify(
      this.receiptMapper.mapAttachmentDetails(
        receiptBooking.itinerary,
        2,
        receiptBooking.bols,
        3
      )
    ));

    if (
      tempBooking.contactEmail !== null 
    ) {
      // Prepare the email data
      const emailData: Prisma.EmailQueueUncheckedCreateInput = {
        template_id: 1, // Set your template ID dynamically
        recipient_email: tempBooking.contactEmail, // Replace with real recipient
        subject: "Booking Confirmation",
        body_variables: bodyDetails, // Converted to JSON
        attachments: attachmentDetails, // Converted to JSON
        status: "Pending",
        priority: 3,
        scheduled_at: new Date(), // Replace with actual scheduling logic
        is_urgent: false,
      };

      await this.emailQueueService.addEmailToQueue(emailData);
    }

    // we remove the temp booking to prevent double booking
    await transactionContext.tempBooking.delete({
      where: {
        id: tempBooking.id,
      },
    });

    const bookingToCreate =
      this.bookingMapper.convertTempBookingToBooking(tempBooking);

    bookingToCreate.id = tempBooking.paymentReference;
    bookingToCreate.bookingStatus = 'Confirmed';
    bookingToCreate.paymentStatus = paymentStatus;
    bookingToCreate.createdAtIso = new Date().toISOString();

    await this.bookingReservationService.saveConfirmedBooking(
      bookingToCreate,
      transactionContext
    );

  }

  async failBooking(
    id: string,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const booking = await transactionContext.booking.findUnique({
      where: {
        id,
      },
      include: {
        bookingTrips: {
          include: {
            bookingTripPassengers: true,
            bookingTripVehicles: true,
          },
        },
      },
    });

    await transactionContext.booking.update({
      where: {
        id,
      },
      data: {
        bookingStatus: 'Failed',
        paymentStatus: 'Failed',
      },
    });

    await this.bookingReservationService.updateTripsCapacities(
      booking.bookingTrips as any,
      'decrement',
      transactionContext
    );
  }

  async cancelBooking(
    bookingId: string,
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    loggedInAccount: IAccount
  ): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        bookingTrips: {
          include: {
            bookingTripPassengers: true,
            bookingTripVehicles: true,
          },
        },
      },
    });

    this.bookingValidator.validateBookingWriteAccess(booking, loggedInAccount);

    if (booking === null) {
      throw new NotFoundException();
    }

    const cancellableStatuses = ['Requested', 'Confirmed'];
    if (!cancellableStatuses.includes(booking.bookingStatus)) {
      throw new BadRequestException(
        `Booking on status ${booking.bookingStatus} cannot be cancelled`
      );
    }

    await this.prisma.$transaction(async (transactionContext) => {
      const passengersRefundAmount =
        await this.bookingPassengerService.updateAllTripPassengersOnBookingCancellation(
          booking,
          remarks,
          reasonType,
          transactionContext as any,
          loggedInAccount
        );
      const vehiclesRefundAmount =
        await this.bookingVehicleService.updateAllTripVehiclesOnBookingCancellation(
          booking,
          reasonType,
          transactionContext as any,
          loggedInAccount
        );
      const totalRefundAmount = passengersRefundAmount + vehiclesRefundAmount;

      await transactionContext.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          bookingStatus: 'Cancelled',
          failureCancellationRemarks: remarks,
          cancellationType: reasonType as any,
          totalPrice: booking.totalPrice - totalRefundAmount,
        },
      });

      if (booking.bookingStatus === 'Confirmed') {
        await this.bookingReservationService.updateTripsCapacities(
          booking.bookingTrips as any[],
          'increment',
          transactionContext as any
        );
      }
    });
  }

  async updateBookingFRR(bookingId: string, frr: string): Promise<void> {
    const where: Prisma.BookingWhereUniqueInput = {
      id: bookingId,
    };
    const booking = await this.prisma.booking.findUnique({
      where,
    });

    if (booking === null) {
      throw new NotFoundException();
    }

    await this.prisma.booking.update({
      where,
      data: {
        freightRateReceipt: frr,
      },
    });
  }

  async getBookingLogs(
    pagination: PaginatedRequest,
    shippingLineId: number,
    loggedInAccount: IAccount,
    status?: string,
    bookingType?: string,
    searchQuery?: string
  ): Promise<PaginatedResponse<IBooking>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.BookingWhereInput = {};

    if (shippingLineId) {
      where.shippingLineId = shippingLineId;
    } else if (loggedInAccount.role === 'ShippingLineAdmin') {
      where.shippingLineId = loggedInAccount.shippingLineId;
    }

    if (status) {
      where.bookingStatus = status;
    }

    if (bookingType) {
      where.createdByAccount = {
        role:
          bookingType === 'ONLINE'
            ? 'Passenger'
            : {
                not: 'Passenger',
              },
      };
    }

    if (searchQuery) {
      where.OR = [
        { referenceNo: { contains: searchQuery, mode: 'insensitive' } },
        { createdByAccount: { email: { contains: searchQuery, mode: 'insensitive' } } },
      ];
    }

    const [bookingEntities, totalBookings] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          createdByAccount: {
            select: {
              role: true,
            },
          },
          bookingTrips: {
            include: {
              trip: {
                include: {
                  srcPort: true,
                  destPort: true,
                },
              },
              bookingTripPassengers: true,
              bookingTripVehicles: true,
            },
          },
          bookingPaymentItems: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: itemsPerPage,
        skip,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const bookings = bookingEntities.map((bookingEntity) => ({
      ...this.bookingMapper.convertBookingToBasicDto(bookingEntity),
      referenceNumber: bookingEntity.referenceNo,
      failureCancellationRemarks: bookingEntity.failureCancellationRemarks,
      bookingStatus: bookingEntity.bookingStatus,
      createdAt: bookingEntity.createdAt.toISOString(),
      creatorRole: bookingEntity.createdByAccount?.role,
    })) as IBooking[];

    return {
      total: totalBookings,
      data: bookings,
    };
  }

  async createQuickBooking(
    tripId: number,
    passengers: { type: string; count: number }[],
    totalPrice: number,
    createdByAccountId: string
  ): Promise<IBooking> {
    try {
      // Step 1: Get full trip data including all required relations
      const trip = await this.tripService.getFullTripsById([tripId]);
      if (!trip || trip.length === 0) {
        throw new NotFoundException('Trip not found');
      }
      const fullTrip = trip[0];

      //Prevent overbooking ---
    const totalRequestedPassengers = passengers.reduce((sum, p) => sum + p.count, 0);
    const availableCapacity = fullTrip.availableCabins.reduce(
      (sum, cabin) => sum + (cabin.availablePassengerCapacity || 0),
      0
    );
    if (totalRequestedPassengers > availableCapacity) {
      throw new BadRequestException(
        `Not enough available passenger capacity. Requested: ${totalRequestedPassengers}, Available: ${availableCapacity}`
      );
    }

      // Get the first available cabin
      const defaultCabin = fullTrip.availableCabins[0]?.cabin;
      if (!defaultCabin) {
        throw new BadRequestException('No available cabins for this trip');
      }

      // Step 2: Create booking template
      const bookingId = uuidv4();
      const referenceNo = generateReferenceNo(fullTrip.shippingLine.name);

      // Create passenger records
      const passengerRecords = [];
      const bookingTripPassengers = [];

      for (const {type, count} of passengers) {
        for (let i = 0; i < count; i++) {
          const passenger = {
            firstName: 'Quick Booking',
            lastName: `${type} ${i + 1}`,
            discountType: type === 'ADULT' ? null : type,
            occupation: '',
            sex: '',
            civilStatus: '',
            address: '',
            nationality: ''
          };
          passengerRecords.push(passenger);

          bookingTripPassengers.push({
            discountType: passenger.discountType,
            tripId,
            cabinId: defaultCabin.id,
            cabin: defaultCabin,
            totalPrice: 0,
            priceWithoutMarkup: 0,
            bookingPaymentItems: []
          });
        }
      }

      // Create booking template with full trip data
      const bookingTemplate: IBooking = {
        id: bookingId,
        referenceNo,
        shippingLineId: fullTrip.shippingLineId,
        bookingType: 'Single',
        bookingStatus: 'Confirmed',
        paymentStatus: 'Success',
        createdAtIso: new Date().toISOString(),
        createdByAccountId,
        isBookingRequest: false,
        totalPrice,
        bookingTrips: [{
          bookingId,
          tripId,
          trip: fullTrip,
          bookingTripPassengers: [],
          bookingTripVehicles: [] // Ensure this is always an array
        }]
      };

      // Step 3: Create passengers in batch
      const createdPassengers = await this.prisma.$transaction(
        passengerRecords.map(passenger =>
          this.prisma.passenger.create({ data: passenger })
        )
      );

      // Step 4: Attach created passengers to booking template
      bookingTemplate.bookingTrips[0].bookingTripPassengers = bookingTripPassengers.map((btp, i) => ({
        ...btp,
        passengerId: createdPassengers[i].id,
        passenger: createdPassengers[i]
      }));
      // Ensure bookingTripVehicles is always an array (even if empty)
      if (!bookingTemplate.bookingTrips[0].bookingTripVehicles) {
        bookingTemplate.bookingTrips[0].bookingTripVehicles = [];
      }

      // Step 5: Calculate pricing
      await this.bookingPricingService.assignBookingPricing(
        bookingTemplate,
        { id: createdByAccountId, role: 'ShippingLineStaff' } as IAccount
      );

      // Step 6: Create final booking
      const booking = await this.prisma.booking.create({
        data: {
          id: bookingTemplate.id,
          referenceNo: bookingTemplate.referenceNo,
          shippingLineId: bookingTemplate.shippingLineId,
          totalPrice: bookingTemplate.totalPrice,
          bookingType: 'Single',
          bookingStatus: 'Confirmed',
          paymentStatus: 'Success',
          createdAt: new Date(),
          createdByAccountId,
          priceWithoutMarkup: bookingTemplate.priceWithoutMarkup,
          isBookingRequest: false,
          bookingTrips: {
            create: {
              tripId,
              bookingTripPassengers: {
                create: bookingTemplate.bookingTrips[0].bookingTripPassengers.map(btp => ({
                  passengerId: btp.passengerId,
                  totalPrice: btp.totalPrice,
                  priceWithoutMarkup: btp.priceWithoutMarkup,
                  discountType: btp.discountType,
                  cabinId: btp.cabinId
                }))
              }
            }
          },
          bookingPaymentItems: {
            create: this.flattenPaymentItems(bookingTemplate, createdPassengers)
          }
        },
        include: {
          bookingTrips: {
            include: {
              trip: {
                include: {
                  srcPort: true,
                  destPort: true
                }
              },
              bookingTripPassengers: {
                include: {
                  passenger: true,
                  cabin: {
                    include: {
                      cabinType: true
                    }
                  }
                }
              },
              bookingTripVehicles: true
            }
          },
          bookingPaymentItems: true
        }
      });

      // Guarantee bookingTripVehicles is always an array for each trip (passenger-only quick booking)
      booking.bookingTrips.forEach(trip => {
        if (!Array.isArray(trip.bookingTripVehicles)) {
          trip.bookingTripVehicles = [];
        }
      });

      // Decrement available capacities after booking creation
      await this.bookingReservationService.updateTripsCapacities(
        booking.bookingTrips as any[],
        'decrement',
        this.prisma
      );

      return this.bookingMapper.convertBookingToBasicDto(booking);

    } catch (error) {
      console.error('Error in createQuickBooking:', error);
      throw error;
    }
  }

  private flattenPaymentItems(booking: IBooking, createdPassengers: any[]): any[] {
    const items: any[] = [];
    booking.bookingTrips[0].bookingTripPassengers.forEach((btp, index) => {
      btp.bookingPaymentItems.forEach(item => {
        items.push({
          tripId: btp.tripId,
          passengerId: createdPassengers[index].id,
          price: item.price,
          description: item.description,
          type: item.type,
          createdAt: new Date(),
          createdByAccountId: booking.createdByAccountId
        });
      });
    });
    return items;
  }
}

function generateReferenceNo(shippingLineName: string): string {
  const prefix = shippingLineName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}
