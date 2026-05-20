import { PrismaService } from '@/prisma.service';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';
import { IAccount, IBookingTripPassenger, IPassenger } from '@ayahay/models';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { BookingPricingService } from './booking-pricing.service';
import { BookingReservationService } from './booking-reservation.service';
import { BookingValidator } from './booking.validator';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerBookingSearchResponse,
} from '@ayahay/http';
import { BookingMapper } from './booking.mapper';
import * as dayjs from 'dayjs';

@Injectable()
export class BookingPassengerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingValidator: BookingValidator,
    private readonly bookingPricingService: BookingPricingService,
    private readonly bookingReservationService: BookingReservationService,
    private readonly bookingMapper: BookingMapper
  ) {}

  async searchPassengerBookings(
    searchQuery: string,
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<PassengerBookingSearchResponse>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.BookingTripPassengerWhereInput = {
      OR: [
        {
          passenger: {
            firstName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
        {
          passenger: {
            lastName: {
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

    const passengersMatchingQuery =
      await this.prisma.bookingTripPassenger.findMany({
        where,
        select: {
          checkInDate: true,
          booking: {
            select: {
              id: true,
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
          passenger: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
      });

    const passengersMatchingQueryCount =
      await this.prisma.bookingTripPassenger.count({
        where,
      });

    return {
      total: passengersMatchingQueryCount,
      data: passengersMatchingQuery.map((passenger) =>
        this.bookingMapper.convertBookingToPassengerSearchResponse(passenger)
      ),
    };
  }

  async getBookingTripPassenger(
    bookingId: string,
    tripId: number,
    passengerId: number,
    loggedInAccount?: IAccount
  ): Promise<IBookingTripPassenger> {
    const bookingTripPassenger =
      await this.prisma.bookingTripPassenger.findUnique({
        where: {
          bookingId_tripId_passengerId: {
            bookingId: bookingId,
            tripId: tripId,
            passengerId: passengerId,
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
      });

    if (bookingTripPassenger === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.verifyLoggedInUserHasAccessToBooking(
      loggedInAccount,
      bookingTripPassenger.booking
    );

    return this.bookingMapper.convertBookingTripPassengerToSummary(
      bookingTripPassenger
    );
  }

  async checkInPassenger(
    bookingId: string,
    tripId: number,
    passengerId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const where: Prisma.BookingTripPassengerWhereUniqueInput = {
      bookingId_tripId_passengerId: {
        bookingId,
        tripId,
        passengerId,
      },
    };

    const bookingTripPassenger =
      await this.prisma.bookingTripPassenger.findUnique({
        where,
        include: {
          booking: true,
        },
      });

    if (
      bookingTripPassenger === null ||
      bookingTripPassenger.removedReason !== null
    ) {
      throw new NotFoundException();
    }

    this.bookingValidator.validateBookingWriteAccess(
      bookingTripPassenger.booking,
      loggedInAccount
    );

    if (bookingTripPassenger.checkInDate !== null) {
      throw new BadRequestException('The passenger has checked in already.');
    }

    await this.prisma.bookingTripPassenger.update({
      where,
      data: {
        checkInDate: new Date(),
      },
    });
  }

  async updateAllTripPassengersOnBookingCancellation(
    booking: any,
    cancellationReason: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    transactionContext: PrismaClient,
    loggedInAccount?: IAccount
  ): Promise<number> {
    let totalRefund = 0;

    for (const bookingTrip of booking.bookingTrips) {
      for (const bookingTripPassenger of bookingTrip.bookingTripPassengers) {
        if (bookingTripPassenger.removedReason !== null) {
          continue;
        }

        const refundedAmount =
          await this.bookingPricingService.refundTripPassenger(
            bookingTripPassenger as any,
            cancellationReason,
            reasonType,
            transactionContext,
            loggedInAccount
          );

        await transactionContext.bookingTripPassenger.update({
          where: {
            bookingId_tripId_passengerId: {
              bookingId: bookingTripPassenger.bookingId,
              tripId: bookingTripPassenger.tripId,
              passengerId: bookingTripPassenger.passengerId,
            },
          },
          data: {
            removedReason: 'Booking Cancelled',
            removedReasonType: reasonType as any,
            totalPrice: bookingTripPassenger.totalPrice - refundedAmount,
          },
        });

        totalRefund += refundedAmount;
      }
    }

    return totalRefund;
  }

  async removeTripPassenger(
    bookingId: string,
    tripId: number,
    passengerId: number,
    removedReason: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    loggedInAccount: IAccount
  ): Promise<void> {
    const where: Prisma.BookingTripPassengerWhereUniqueInput = {
      bookingId_tripId_passengerId: {
        bookingId,
        tripId,
        passengerId,
      },
    };

    const bookingTripPassenger =
      await this.prisma.bookingTripPassenger.findUnique({
        where,
        include: {
          booking: true,
        },
      });

    if (bookingTripPassenger === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.validateBookingWriteAccess(
      bookingTripPassenger.booking,
      loggedInAccount
    );

    if (bookingTripPassenger.removedReason !== null) {
      throw new BadRequestException('The passenger has been removed already.');
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await this._removeTripPassenger(
        bookingTripPassenger,
        removedReason,
        reasonType,
        loggedInAccount,
        transactionContext as any
      );
    });
  }

  // this is a multi-update operation; always use this function in a transaction
  private async _removeTripPassenger(
    bookingTripPassenger: any,
    removedReason: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    loggedInAccount: IAccount,
    transactionContext: PrismaClient
  ): Promise<void> {
    const refundedAmount = await this.bookingPricingService.refundTripPassenger(
      bookingTripPassenger as any,
      removedReason,
      reasonType,
      transactionContext as any,
      loggedInAccount
    );

    await transactionContext.booking.update({
      where: { id: bookingTripPassenger.bookingId },
      data: {
        totalPrice: bookingTripPassenger.booking.totalPrice - refundedAmount,
      },
    });

    await transactionContext.bookingTripPassenger.update({
      where: {
        bookingId_tripId_passengerId: {
          bookingId: bookingTripPassenger.bookingId,
          tripId: bookingTripPassenger.tripId,
          passengerId: bookingTripPassenger.passengerId,
        },
      },
      data: {
        removedReason,
        removedReasonType: reasonType as any,
        totalPrice: bookingTripPassenger.totalPrice - refundedAmount,
      },
    });

    await this.bookingReservationService.updatePassengerCapacities(
      [bookingTripPassenger] as any[],
      'increment',
      transactionContext as any
    );
  }

  async editPassengerInformation(
    bookingId: string,
    tripId: number,
    passengerId: number,
    passenger: IPassenger,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripPassenger = await this.prisma.bookingTripPassenger.findUnique({
      where: {
        bookingId_tripId_passengerId: { bookingId, tripId, passengerId },
      },
      include: {
        booking: { include: { createdByAccount: true } },
        passenger: { include: { account: true } },
      },
    });
    if (tripPassenger === null) {
      throw new NotFoundException('No such trip passenger.');
    }
    const { booking, passenger: passengerToUpdate } = tripPassenger;
    await this.bookingValidator.validateBookingWriteAccess(
      booking,
      loggedInAccount
    );

    // if the passenger is linked to an account
    if (
      passengerToUpdate.account !== null ||
      passengerToUpdate.buddyId !== null
    ) {
      // we don't allow updating the passenger information without account owner's consent,
      throw new ForbiddenException('This passenger is linked to an account.');
    }

    const oldPassengerFullName = `${passengerToUpdate.firstName} ${passengerToUpdate.lastName}`;
    const newPassengerFullName = `${passenger.firstName} ${passenger.lastName}`;
    const isOldPassengerConsignee =
      booking.consigneeName === oldPassengerFullName;
    const bookingUpdate = isOldPassengerConsignee
      ? { consigneeName: newPassengerFullName }
      : undefined;

    await this.prisma.bookingTripPassenger.update({
      where: {
        bookingId_tripId_passengerId: { bookingId, tripId, passengerId },
      },
      data: {
        passenger: {
          update: {
            data: {
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              sex: passenger.sex,
              birthday: passenger.birthdayIso,
              address: passenger.address,
              nationality: passenger.nationality,
              occupation: passenger.occupation,
              civilStatus: passenger.civilStatus,
            },
          },
        },
        booking: {
          update: bookingUpdate,
        },
      },
    });
  }

  async rebookTripPassenger(
    bookingId: string,
    tripId: number,
    passengerId: number,
    tempBookingId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripPassenger = await this.prisma.bookingTripPassenger.findUnique({
      where: {
        bookingId_tripId_passengerId: {
          bookingId,
          tripId,
          passengerId,
        },
      },
      include: {
        trip: true,
        booking: true,
      },
    });
    if (tripPassenger === null) {
      throw new NotFoundException('Trip passenger not found.');
    }

    this.bookingValidator.validateBookingWriteAccess(
      tripPassenger.booking,
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
      tripPassenger as any,
      newBooking
    );

    const newBookingTrip = newBooking.bookingTrips[0];
    const newTripPassenger =
      newBooking.bookingTrips[0].bookingTripPassengers[0];
    newBookingTrip.bookingId = newTripPassenger.bookingId = bookingId;

    const tripDepartureDate = dayjs(
      newBookingTrip.trip.departureDateIso
    ).format('YYYY, MMM DD, HH:MM AA');

    await this.prisma.$transaction(async (transactionContext) => {
      await this._removeTripPassenger(
        tripPassenger,
        `Rebooked to ${tripDepartureDate} trip`,
        'NoFault',
        loggedInAccount,
        transactionContext as any
      );

      await this.bookingPricingService.adjustBookingPaymentItemsOnRebooking(
        tripPassenger as any,
        newTripPassenger,
        transactionContext as any
      );

      await transactionContext.bookingTripPassenger.create(
        this.bookingMapper.convertTripPassengerToEntityForCreation(
          newTripPassenger,
          loggedInAccount
        )
      );

      await this.bookingReservationService.updatePassengerCapacities(
        [newTripPassenger] as any[],
        'decrement',
        transactionContext as any
      );
    });
  }
}
