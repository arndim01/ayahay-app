import { PrismaService } from '@/prisma.service';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';
import { IAccount, IBookingTripVehicle, IVehicle } from '@ayahay/models';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingValidator } from './booking.validator';
import { Prisma, PrismaClient } from '@prisma/client';
import { BookingPricingService } from './booking-pricing.service';
import { BookingReservationService } from './booking-reservation.service';
import { BookingMapper } from './booking.mapper';
import {
  PaginatedRequest,
  PaginatedResponse,
  VehicleBookingSearchResponse,
} from '@ayahay/http';
import * as dayjs from 'dayjs';

@Injectable()
export class BookingVehicleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingValidator: BookingValidator,
    private readonly bookingPricingService: BookingPricingService,
    private readonly bookingReservationService: BookingReservationService,
    private readonly bookingMapper: BookingMapper
  ) {}

  async getBookingTripVehicle(
    bookingId: string,
    tripId: number,
    vehicleId: number,
    loggedInAccount?: IAccount
  ): Promise<IBookingTripVehicle> {
    const bookingTripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where: {
        bookingId_tripId_vehicleId: {
          bookingId: bookingId,
          tripId: tripId,
          vehicleId: vehicleId,
        },
      },
      include: {
        booking: true,
        trip: {
          include: {
            srcPort: true,
            destPort: true,
            shippingLine: true,
          },
        },
        vehicle: {
          include: {
            vehicleType: true,
          },
        },
        bookingPaymentItems: true,
      },
    });

    if (bookingTripVehicle === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.verifyLoggedInUserHasAccessToBooking(
      loggedInAccount,
      bookingTripVehicle.booking
    );

    return this.bookingMapper.convertBookingTripVehicleToSummary(
      bookingTripVehicle
    );
  }

  async searchVehicleBookings(
    searchQuery: string,
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<VehicleBookingSearchResponse>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.BookingTripVehicleWhereInput = {
      OR: [
        {
          vehicle: {
            plateNo: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
        {
          vehicle: {
            modelName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
        {
          booking: {
            referenceNo: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
      ],
      trip: {
        shippingLineId: loggedInAccount.shippingLineId,
      },
    };

    const vehiclesMatchingQuery = await this.prisma.bookingTripVehicle.findMany(
      {
        where,
        select: {
          checkInDate: true,
          booking: {
            select: {
              id: true,
              bookingStatus: true,
              referenceNo: true,
            },
          },
          trip: {
            select: {
              id: true,
              departureDate: true,
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
            },
          },
          vehicle: {
            select: {
              id: true,
              plateNo: true,
              modelName: true,
              modelYear: true,
            },
          },
        },
        orderBy: {
          booking: {
            createdAt: 'desc',
          },
        },
        take: itemsPerPage,
        skip,
      }
    );

    const vehiclesMatchingQueryCount =
      await this.prisma.bookingTripVehicle.count({
        where,
      });

    return {
      total: vehiclesMatchingQueryCount,
      data: vehiclesMatchingQuery.map((vehicle) =>
        this.bookingMapper.convertBookingToVehicleSearchResponse(vehicle)
      ),
    };
  }

  async checkInVehicle(
    bookingId: string,
    tripId: number,
    vehicleId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const where: Prisma.BookingTripVehicleWhereUniqueInput = {
      bookingId_tripId_vehicleId: {
        bookingId,
        tripId,
        vehicleId,
      },
    };
    const bookingTripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where,
      include: {
        booking: true,
      },
    });

    if (bookingTripVehicle === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.validateBookingWriteAccess(
      bookingTripVehicle.booking,
      loggedInAccount
    );

    if (bookingTripVehicle.checkInDate !== null) {
      throw new BadRequestException('The vehicle has checked in already.');
    }

    await this.prisma.bookingTripVehicle.update({
      where,
      data: {
        checkInDate: new Date(),
      },
    });
  }

  async updateAllTripVehiclesOnBookingCancellation(
    booking: any,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    transactionContext: PrismaClient,
    loggedInAccount?: IAccount
  ): Promise<number> {
    let totalRefund = 0;

    for (const bookingTrip of booking.bookingTrips) {
      for (const bookingTripVehicle of bookingTrip.bookingTripVehicles) {
        if (bookingTripVehicle.removedReason !== null) {
          continue;
        }

        const refundedAmount =
          await this.bookingPricingService.refundTripVehicle(
            bookingTripVehicle as any,
            reasonType,
            transactionContext,
            loggedInAccount
          );

        await transactionContext.bookingTripVehicle.update({
          where: {
            bookingId_tripId_vehicleId: {
              bookingId: bookingTripVehicle.bookingId,
              tripId: bookingTripVehicle.tripId,
              vehicleId: bookingTripVehicle.vehicleId,
            },
          },
          data: {
            removedReason: 'Booking Cancelled',
            removedReasonType: reasonType as any,
            totalPrice: bookingTripVehicle.totalPrice - refundedAmount,
          },
        });

        totalRefund += refundedAmount;
      }
    }

    return totalRefund;
  }

  async removeTripVehicle(
    bookingId: string,
    tripId: number,
    vehicleId: number,
    removedReason: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    loggedInAccount: IAccount
  ): Promise<void> {
    const where: Prisma.BookingTripVehicleWhereUniqueInput = {
      bookingId_tripId_vehicleId: {
        bookingId,
        tripId,
        vehicleId,
      },
    };

    const bookingTripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where,
      include: {
        booking: true,
      },
    });

    if (bookingTripVehicle === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.validateBookingWriteAccess(
      bookingTripVehicle.booking,
      loggedInAccount
    );

    if (bookingTripVehicle.removedReason !== null) {
      throw new BadRequestException('The vehicle has been removed already.');
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await this._removeTripVehicle(
        bookingTripVehicle as any,
        removedReason,
        reasonType,
        loggedInAccount,
        transactionContext as any
      );
    });
  }

  // this is a multi-update operation; always use this function in a transaction
  private async _removeTripVehicle(
    bookingTripVehicle: IBookingTripVehicle,
    removedReason: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    loggedInAccount: IAccount,
    transactionContext: PrismaClient
  ): Promise<void> {
    const refundedAmount = await this.bookingPricingService.refundTripVehicle(
      bookingTripVehicle as any,
      reasonType,
      transactionContext as any,
      loggedInAccount
    );

    await transactionContext.booking.update({
      where: { id: bookingTripVehicle.bookingId },
      data: {
        totalPrice: bookingTripVehicle.booking.totalPrice - refundedAmount,
      },
    });

    await transactionContext.bookingTripVehicle.update({
      where: {
        bookingId_tripId_vehicleId: {
          bookingId: bookingTripVehicle.bookingId,
          tripId: bookingTripVehicle.tripId,
          vehicleId: bookingTripVehicle.vehicleId,
        },
      },
      data: {
        removedReason,
        removedReasonType: reasonType as any,
        totalPrice: bookingTripVehicle.totalPrice - refundedAmount,
      },
    });

    await this.bookingReservationService.updateVehicleCapacities(
      [bookingTripVehicle] as any[],
      'increment',
      transactionContext as any
    );
  }

  async editVehicleInformation(
    bookingId: string,
    tripId: number,
    vehicleId: number,
    vehicle: IVehicle,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where: { bookingId_tripId_vehicleId: { bookingId, tripId, vehicleId } },
      include: {
        booking: { include: { createdByAccount: true } },
        vehicle: { include: { account: true } },
      },
    });
    if (tripVehicle === null) {
      throw new NotFoundException('No such trip vehicle.');
    }
    const { booking, vehicle: vehicleToUpdate } = tripVehicle;
    await this.bookingValidator.validateBookingWriteAccess(
      booking,
      loggedInAccount
    );
    // if the vehicle is linked to an account
    if (vehicleToUpdate.account !== null) {
      // we don't allow updating the vehicle information without account owner's consent,
      throw new ForbiddenException('This vehicle is linked to an account.');
    }
    await this.prisma.bookingTripVehicle.update({
      where: { bookingId_tripId_vehicleId: { bookingId, tripId, vehicleId } },
      data: {
        vehicle: {
          update: {
            data: {
              plateNo: vehicle.plateNo,
              modelName: vehicle.modelName,
              modelYear: vehicle.modelYear,
            },
          },
        },
      },
    });
  }

  async rebookTripVehicle(
    bookingId: string,
    tripId: number,
    vehicleId: number,
    tempBookingId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where: {
        bookingId_tripId_vehicleId: {
          bookingId,
          tripId,
          vehicleId,
        },
      },
      include: {
        trip: true,
        booking: true,
      },
    });
    if (tripVehicle === null) {
      throw new NotFoundException('Trip vehicle not found.');
    }

    this.bookingValidator.validateBookingWriteAccess(
      tripVehicle.booking,
      loggedInAccount
    );

    const tempBooking = await this.prisma.tempBooking.findUnique({
      where: {
        id: tempBookingId,
      },
    });
    if (tempBooking === null) {
      throw new NotFoundException('Booking quote not found.');
    }

    const newBooking =
      this.bookingMapper.convertTempBookingToBooking(tempBooking);

    await this.bookingValidator.validateRebooking(
      tripVehicle as any,
      newBooking
    );

    const newBookingTrip = newBooking.bookingTrips[0];
    const newTripVehicle = newBooking.bookingTrips[0].bookingTripVehicles[0];
    newBookingTrip.bookingId = newTripVehicle.bookingId = bookingId;

    const tripDepartureDate = dayjs(
      newBookingTrip.trip.departureDateIso
    ).format('YYYY, MMM DD, HH:MM AA');

    await this.prisma.$transaction(async (transactionContext) => {
      await this._removeTripVehicle(
        tripVehicle as any,
        `Rebooked to ${tripDepartureDate} trip`,
        'NoFault',
        loggedInAccount,
        transactionContext as any
      );

      await this.bookingPricingService.adjustBookingPaymentItemsOnRebooking(
        tripVehicle as any,
        newTripVehicle,
        transactionContext as any
      );

      await transactionContext.bookingTripVehicle.create(
        this.bookingMapper.convertTripVehicleToEntityForCreation(
          newTripVehicle,
          loggedInAccount
        )
      );

      await this.bookingReservationService.updateVehicleCapacities(
        [newTripVehicle] as any[],
        'decrement',
        transactionContext as any
      );
    });
  }
}
