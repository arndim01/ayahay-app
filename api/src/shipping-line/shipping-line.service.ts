import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import {
  IAccount,
  IPort,
  IShippingLine,
  IShippingLineSchedule,
  ITrip,
} from '@ayahay/models';
import { CreateTripsFromSchedulesRequest } from '@ayahay/http';
import { ShippingLineMapper } from './shipping-line.mapper';
import { UtilityService } from '@/utility.service';
import { AuthService } from '@/auth/auth.service';
import { PortMapper } from '@/port/port.mapper';

@Injectable()
export class ShippingLineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper,
    private readonly utilityService: UtilityService,
    private readonly authService: AuthService
  ) {}

  async getShippingLines(): Promise<IShippingLine[]> {
    const shippingLines = await this.prisma.shippingLine.findMany({
      include: {
        seatTypes: true,
      },
    });
    return shippingLines.map((shippingLine) =>
      this.shippingLineMapper.convertShippingLineToFullDto(shippingLine)
    );
  }

  async getSchedulesOfShippingLine(
    shippingLineId: number,
    loggedInAccount: IAccount
  ): Promise<IShippingLineSchedule[]> {
    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      { shippingLineId },
      loggedInAccount
    );
    const shippingLineScheduleEntities =
      await this.prisma.shippingLineSchedule.findMany({
        where: {
          shippingLineId,
        },
        include: {
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
            },
          },
        },
      });

    return shippingLineScheduleEntities.map((shippingLineScheduleEntity) =>
      this.shippingLineMapper.convertShippingLineScheduleToDto(
        shippingLineScheduleEntity
      )
    );
  }

  async getPortsByShippingLine(shippingLineId: number): Promise<IPort[]> {
    console.log('getPortsByShippingLine called with:', { shippingLineId });

    const ports = await this.prisma.shippingLinePort.findMany({
      where: { shippingLineId },
      include: { port: true },
    });

    console.log('Shipping line ports found:', {
      count: ports.length,
      portIds: ports.map((p) => p.port.id),
      portNames: ports.map((p) => p.port.name),
    });

    return ports.map(({ port }) => this.portMapper.convertPortToDto(port));
  }

  async convertSchedulesToTrips(
    createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest,
    loggedInAccount: IAccount
  ): Promise<ITrip[]> {
    const scheduleIds = createTripsFromSchedulesRequest.schedules.map(
      (schedule) => schedule.scheduleId
    );
    const scheduleEntities = await this.prisma.shippingLineSchedule.findMany({
      where: {
        id: {
          in: scheduleIds,
        },
      },
      include: {
        ship: {
          include: {
            cabins: true,
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
          },
        },
      },
    });

    if (scheduleEntities.length !== scheduleIds.length) {
      throw new BadRequestException('One or more schedules is invalid');
    }

    scheduleEntities.forEach((schedule) =>
      this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
        schedule,
        loggedInAccount
      )
    );

    const trips: ITrip[] = [];
    for (const schedule of scheduleEntities) {
      const bookingCutOffPreference = await this.prisma.bookingCutoff.findFirst(
        {
          where: {
            shipping_line_id: schedule.shippingLineId,
            origin: schedule.srcPortId,
            destination: schedule.destPortId,
          },
        }
      );

      for (const dateRange of createTripsFromSchedulesRequest.dateRanges) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        for (
          let currentDate = startDate;
          currentDate <= endDate;
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          const tripToCreate =
            this.shippingLineMapper.convertScheduleToTrip(schedule);

          // Store the original schedule ID to help with error reporting
          (tripToCreate as any).scheduleId = schedule.id;

          const yyyyYear = currentDate.getFullYear();
          const mmMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
          const ddDay = String(currentDate.getDate()).padStart(2, '0');
          const hhHour = String(schedule.departureHour).padStart(2, '0');
          const mmMinute = String(schedule.departureMinute).padStart(2, '0');
          const hhMmTimezone = '+08:00';
          const departureDate = new Date(
            `${yyyyYear}-${mmMonth}-${ddDay}T${hhHour}:${mmMinute}:00.000${hhMmTimezone}`
          );

          tripToCreate.departureDateIso = tripToCreate.bookingStartDateIso =
            departureDate.toISOString();

          // Calculate booking cutoff date based on preferences or default
          const bookingCutOffDate = new Date(departureDate);

          if (!bookingCutOffPreference) {
            console.warn(
              `No booking cutoff preference found for Shipping Line ${schedule.shippingLineId}, Origin ${schedule.srcPortId}, Destination ${schedule.destPortId}. Using default 24 hours before departure.`
            );
            bookingCutOffDate.setHours(bookingCutOffDate.getHours() - 24);
          } else {
            const { cut_off_condition_type, cut_off_value } =
              bookingCutOffPreference;

            if (cut_off_condition_type === 'number_of_hours') {
              bookingCutOffDate.setHours(
                bookingCutOffDate.getHours() - cut_off_value
              );
            } else if (cut_off_condition_type === 'fixed_hour') {
              const [hours, minutes] = String(cut_off_value)
                .split(':')
                .map(Number);
              bookingCutOffDate.setDate(bookingCutOffDate.getDate() - 1);
              bookingCutOffDate.setHours(hours, minutes || 0, 0, 0);
            } else {
              console.warn(
                `Unknown booking cutoff condition type: ${cut_off_condition_type}. Using default 24 hours before departure.`
              );
              bookingCutOffDate.setHours(bookingCutOffDate.getHours() - 24);
            }
          }

          tripToCreate.bookingCutOffDateIso = bookingCutOffDate.toISOString();
          tripToCreate.referenceNo =
            this.utilityService.generateRandomAlphanumericString(6);

          trips.push(tripToCreate);
        }
      }
    }

    return trips;
  }

  async populateShippingLinePorts(
    shippingLineId: number
  ): Promise<{ message: string; count: number }> {
    // First validate the shipping line exists
    const shippingLine = await this.prisma.shippingLine.findUnique({
      where: { id: shippingLineId },
    });

    if (!shippingLine) {
      throw new NotFoundException(
        `Shipping line with ID ${shippingLineId} not found`
      );
    }

    // Get all ports
    const allPorts = await this.prisma.port.findMany();

    // Create the shipping line port associations
    const shippingLinePorts = allPorts.map((port) => ({
      shippingLineId: shippingLineId,
      portId: port.id,
    }));

    // Delete existing associations
    await this.prisma.shippingLinePort.deleteMany({
      where: { shippingLineId },
    });

    // Insert new associations
    await this.prisma.shippingLinePort.createMany({
      data: shippingLinePorts,
      skipDuplicates: true,
    });

    return {
      message: `Successfully associated ${allPorts.length} ports with shipping line ${shippingLine.name}`,
      count: allPorts.length,
    };
  }
}
