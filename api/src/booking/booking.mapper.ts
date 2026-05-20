import { Injectable } from '@nestjs/common';
import {
  IBooking,
  IBookingTrip,
  IBookingTripPassenger,
  IBookingTripVehicle,
  IBookingPaymentItem,
  IAccount,
} from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { TripMapper } from '@/trip/trip.mapper';
import { PassengerMapper } from '@/passenger/passenger.mapper';
import { CabinMapper } from '@/cabin/cabin.mapper';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { PaymentMapper } from '@/payment/payment.mapper';
import {
  VehicleBookings,
  PassengerBookingSearchResponse,
  VehicleBookingSearchResponse,
} from '@ayahay/http';
import { AccountMapper } from '@/account/account.mapper';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';
import { SeatPlanMapper } from '@/seat-plan/seat-plan.mapper';

@Injectable()
export class BookingMapper {
  constructor(
    private readonly tripMapper: TripMapper,
    private readonly passengerMapper: PassengerMapper,
    private readonly cabinMapper: CabinMapper,
    private readonly seatPlanMapper: SeatPlanMapper,
    private readonly paymentMapper: PaymentMapper,
    private readonly vehicleMapper: VehicleMapper,
    private readonly accountMapper: AccountMapper,
    private readonly shippingLineMapper: ShippingLineMapper
  ) {}

  // TO DO: improve conversion booking to DTO
  convertBookingToBasicDto(booking): IBooking {
    return {
      id: booking.id,
      shippingLineId: booking.shippingLineId,
      createdByAccountId: booking.createdByAccountId,
      createdByAccount: booking.createdByAccount,
      approvedByAccountId: booking.approvedByAccountId,
      approvedByAccount: booking.approvedByAccount,

      referenceNo: booking.referenceNo,
      freightRateReceipt: booking.freightRateReceipt,
      bookingStatus: booking.bookingStatus as any,
      paymentStatus: booking.paymentStatus as any,
      totalPrice: booking.totalPrice,
      bookingType: booking.bookingType as any,
      contactEmail: booking.contactEmail,
      contactMobile: booking.contactMobile,
      createdAtIso: booking.createdAt.toISOString(),
      isBookingRequest: booking.isBookingRequest,
      remarks: booking.remarks,

      bookingTrips: booking.bookingTrips?.map((bookingTrip) => {
        return {
          ...bookingTrip,
          trip: {
            ...bookingTrip.trip,
            departureDateIso: bookingTrip.trip?.departureDate?.toISOString(),
          },
        };
      }),
      bookingPaymentItems: booking.bookingPaymentItems,
    };
  }

  convertBookingToSummary(booking: any): IBooking {
    return {
      id: booking.id,
      shippingLineId: booking.shippingLineId,
      shippingLine: this.shippingLineMapper.convertShippingLineToSimpleDto(
        booking.shippingLine
      ),
      createdByAccountId: booking.createdByAccountId ?? undefined,
      createdByAccount: this.accountMapper.convertAccountToDto(
        booking.createdByAccount
      ),
      approvedByAccountId: booking.approvedByAccountId ?? undefined,
      voucherCode: booking.voucherCode,

      referenceNo: booking.referenceNo,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      bookingType: booking.bookingType,
      contactEmail: booking.contactEmail,
      contactMobile: booking.contactMobile,
      createdAtIso: booking.createdAt.toISOString(),
      isBookingRequest: booking.isBookingRequest,
      remarks: booking.remarks,

      bookingTrips: booking.bookingTrips.map((bookingTrip) =>
        this.convertBookingTripToSummary(bookingTrip)
      ),
      bookingPaymentItems: booking.bookingPaymentItems?.map((paymentItem) =>
        this.paymentMapper.convertPaymentItemToDto(paymentItem)
      ),
    };
  }

  convertBookingToBookingTripVehicle(booking: any): VehicleBookings {
    return {
      id: booking.id,
      referenceNo: booking.referenceNo,
      totalPrice: booking.totalPrice,

      bookingTripVehicles: booking.bookingTripVehicles.map(
        (bookingTripVehicle) =>
          this.convertBookingTripVehicleToSummary(bookingTripVehicle)
      ),
    };
  }

  private convertBookingTripToSummary(bookingTrip: any): IBookingTrip {
    return {
      bookingId: bookingTrip.bookingId,
      tripId: bookingTrip.tripId,
      trip: bookingTrip.trip
        ? this.tripMapper.convertTripToBasicDto(bookingTrip.trip)
        : undefined,
      bookingTripPassengers: bookingTrip.bookingTripPassengers?.map(
        (bookingTripPassenger) =>
          this.convertBookingTripPassengerToSummary(bookingTripPassenger)
      ),
      bookingTripVehicles: bookingTrip.bookingTripVehicles?.map(
        (bookingTripVehicle) =>
          this.convertBookingTripVehicleToSummary(bookingTripVehicle)
      ),
    };
  }

  convertBookingTripPassengerToSummary(
    bookingTripPassenger: any
  ): IBookingTripPassenger {
    return {
      bookingId: bookingTripPassenger.bookingId,
      booking: bookingTripPassenger.booking
        ? this.convertBookingToBasicDto(bookingTripPassenger.booking)
        : undefined,
      tripId: bookingTripPassenger.tripId,
      trip: bookingTripPassenger.trip
        ? this.tripMapper.convertTripToDto(bookingTripPassenger.trip)
        : undefined,
      passengerId: bookingTripPassenger.passengerId,
      passenger: this.passengerMapper.convertPassengerToDto(
        bookingTripPassenger.passenger
      ),
      cabinId: bookingTripPassenger.cabinId,
      cabin: this.cabinMapper.convertCabinToDto(bookingTripPassenger.cabin),
      seatId: bookingTripPassenger.seatId,
      seat: this.seatPlanMapper.convertSeatToDto(bookingTripPassenger.seat),

      meal: bookingTripPassenger.meal,
      totalPrice: bookingTripPassenger.totalPrice ?? undefined,
      checkInDate: bookingTripPassenger.checkInDate ?? undefined,
      removedReason: bookingTripPassenger.removedReason ?? undefined,
      discountType: bookingTripPassenger.discountType ?? undefined,

      bookingPaymentItems: bookingTripPassenger.bookingPaymentItems?.map(
        (paymentItem) => this.paymentMapper.convertPaymentItemToDto(paymentItem)
      ),
    };
  }

  convertBookingTripVehicleToSummary(
    bookingTripVehicle: any
  ): IBookingTripVehicle {
    return {
      bookingId: bookingTripVehicle.bookingId,
      booking: bookingTripVehicle.booking
        ? this.convertBookingToBasicDto(bookingTripVehicle.booking)
        : undefined,
      tripId: bookingTripVehicle.tripId,
      trip: bookingTripVehicle.trip
        ? this.tripMapper.convertTripToDto(bookingTripVehicle.trip)
        : undefined,
      vehicleId: bookingTripVehicle.vehicleId,
      vehicle: this.vehicleMapper.convertVehicleToDto(
        bookingTripVehicle.vehicle
      ),

      totalPrice: bookingTripVehicle.totalPrice ?? undefined,
      checkInDate: bookingTripVehicle.checkInDate ?? undefined,
      removedReason: bookingTripVehicle.removedReason ?? undefined,

      bookingPaymentItems: bookingTripVehicle.bookingPaymentItems?.map(
        (paymentItem) => this.paymentMapper.convertPaymentItemToDto(paymentItem)
      ),
    };
  }

  /**
   *  Admins are only interested in the vehicles/rolling cargos of
   *  booking requests
   */
  convertBookingRequestToAdminDto(tempBooking: any): IBooking {
    const bookingTrips =
      tempBooking.bookingTripsJson as any[] as IBookingTrip[];

    return {
      id: tempBooking.id.toString(),
      shippingLineId: tempBooking.shippingLineId,
      createdByAccountId: tempBooking.createdByAccountId ?? undefined,
      approvedByAccountId: tempBooking.approvedByAccountId ?? undefined,
      voucherCode: tempBooking.voucherCode,

      referenceNo: tempBooking.referenceNo,
      bookingStatus: tempBooking.bookingStatus,
      paymentStatus: tempBooking.paymentStatus,
      totalPrice: tempBooking.totalPrice,
      bookingType: tempBooking.bookingType,
      contactEmail: tempBooking.contactEmail,
      contactMobile: tempBooking.contactMobile,
      createdAtIso: tempBooking.createdAt.toISOString(),
      isBookingRequest: tempBooking.isBookingRequest,

      bookingTrips,
    };
  }

  convertBookingToTempBookingEntityForCreation(
    booking: IBooking
  ): Prisma.TempBookingCreateArgs {
    const bookingTripsJson = booking.bookingTrips as any[] as Prisma.JsonArray;
    const bookingPaymentItemsJson =
      booking.bookingPaymentItems as any[] as Prisma.JsonArray;

    return {
      data: {
        shippingLineId: booking.shippingLineId,
        createdByAccountId: booking.createdByAccountId ?? null,
        voucherCode: booking.voucherCode ?? null,

        totalPrice: booking.totalPrice,
        priceWithoutMarkup: booking.priceWithoutMarkup ?? 0,
        bookingType: booking.bookingType,
        createdAt: new Date(booking.createdAtIso),
        contactEmail: booking.contactEmail,
        contactMobile: booking.contactMobile,
        consigneeName: booking.consigneeName,
        isBookingRequest: booking.isBookingRequest,
        remarks: booking.remarks,

        bookingTripsJson,
        bookingPaymentItemsJson,
      },
    };
  }

  convertTempBookingToBooking(tempBooking: any): IBooking {
    const bookingTrips =
      tempBooking.bookingTripsJson as any[] as IBookingTrip[];
    const bookingPaymentItems =
      tempBooking.bookingPaymentItemsJson as any[] as IBookingPaymentItem[];

    return {
      id: tempBooking.id.toString(),
      shippingLineId: tempBooking.shippingLineId,
      createdByAccountId: tempBooking.createdByAccountId ?? undefined,
      createdByAccount: tempBooking.createdByAccount,
      approvedByAccountId: tempBooking.approvedByAccountId ?? undefined,
      voucherCode: tempBooking.voucherCode ?? undefined,

      referenceNo: tempBooking.paymentReference?.substring(0, 6)?.toUpperCase(),
      bookingStatus: undefined,
      paymentStatus: undefined,
      totalPrice: tempBooking.totalPrice,
      priceWithoutMarkup: tempBooking.priceWithoutMarkup,
      bookingType: tempBooking.bookingType as any,
      contactEmail: tempBooking.contactEmail,
      contactMobile: tempBooking.contactMobile,
      createdAtIso: tempBooking.createdAt.toISOString(),
      isBookingRequest: tempBooking.isBookingRequest,
      consigneeName: tempBooking.consigneeName ?? undefined,
      firstTripId: bookingTrips.length > 1 ? bookingTrips[0].tripId : null,
      remarks: tempBooking.remarks,

      bookingTrips,
      bookingPaymentItems,
    };
  }

  convertBookingToEntityForCreation(
    booking: IBooking
  ): Prisma.BookingCreateArgs {
    const bookingTrips: Prisma.BookingTripCreateManyBookingInput[] = [];
    const bookingTripPassengers: Prisma.BookingTripPassengerCreateManyBookingInput[] =
      [];
    const bookingTripVehicles: Prisma.BookingTripVehicleCreateManyBookingInput[] =
      [];
    const bookingPaymentItems: Prisma.BookingPaymentItemCreateManyBookingInput[] =
      [];

    booking.bookingTrips.forEach((bookingTrip) => {
      bookingTrips.push({
        tripId: bookingTrip.tripId,
      });

      bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
        bookingTripPassengers.push({
          meal: bookingTripPassenger.meal ?? null,
          checkInDate: null,
          tripId: bookingTripPassenger.tripId,
          passengerId: bookingTripPassenger.passengerId,
          seatId: bookingTripPassenger.seatId ?? null,
          cabinId: bookingTripPassenger.cabinId,
          totalPrice: bookingTripPassenger.totalPrice ?? 0,
          priceWithoutMarkup: bookingTripPassenger.priceWithoutMarkup ?? 0,
          discountType: bookingTripPassenger.discountType ?? null,
        });
        bookingTripPassenger.bookingPaymentItems.forEach((paymentItem) =>
          bookingPaymentItems.push({
            tripId: paymentItem.tripId,
            passengerId: paymentItem.passengerId,
            price: paymentItem.price,
            description: paymentItem.description,
            type: paymentItem.type,
            createdByAccountId: booking.createdByAccountId ?? null,
            createdAt: new Date(),
          })
        );
      });

      bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
        bookingTripVehicles.push({
          tripId: bookingTripVehicle.tripId,
          vehicleId: bookingTripVehicle.vehicleId,
          totalPrice: bookingTripVehicle.totalPrice ?? 0,
          priceWithoutMarkup: bookingTripVehicle.priceWithoutMarkup ?? 0,
        });
        bookingTripVehicle.bookingPaymentItems.forEach((paymentItem) =>
          bookingPaymentItems.push({
            tripId: paymentItem.tripId,
            vehicleId: paymentItem.vehicleId,
            price: paymentItem.price,
            description: paymentItem.description,
            type: paymentItem.type,
            createdByAccountId: booking.createdByAccountId ?? null,
            createdAt: new Date(),
          })
        );
      });
    });

    return {
      data: {
        id: booking.id,
        shippingLineId: booking.shippingLineId,
        createdByAccountId: booking.createdByAccountId ?? null,
        approvedByAccountId: booking.approvedByAccountId ?? null,
        voucherCode: booking.voucherCode ?? null,

        referenceNo: booking.referenceNo,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        priceWithoutMarkup: booking.priceWithoutMarkup ?? 0,
        bookingType: booking.bookingType,
        contactEmail: booking.contactEmail,
        contactMobile: booking.contactMobile,
        createdAt: booking.createdAtIso,
        isBookingRequest: booking.isBookingRequest,
        consigneeName: booking.consigneeName,
        firstTripId: booking.firstTripId,
        remarks: booking.remarks,

        bookingTrips: {
          createMany: {
            data: bookingTrips,
          },
        },
        bookingTripPassengers: {
          createMany: {
            data: bookingTripPassengers,
          },
        },
        bookingTripVehicles: {
          createMany: {
            data: bookingTripVehicles,
          },
        },
        bookingPaymentItems: {
          createMany: {
            data: bookingPaymentItems,
          },
        },
      },
    };
  }

  convertBookingToPassengerSearchResponse(
    bookingTripPassenger: any
  ): PassengerBookingSearchResponse {
    return {
      bookingId: bookingTripPassenger.booking.id,
      tripId: bookingTripPassenger.trip.id,
      passengerId: bookingTripPassenger.passenger.id,
      bookingStatus: bookingTripPassenger.booking.bookingStatus,
      tripDepartureDateIso:
        bookingTripPassenger.trip.departureDate.toISOString(),
      tripSrcPortName: bookingTripPassenger.trip.srcPort.name,
      tripDestPortName: bookingTripPassenger.trip.destPort.name,
      firstName: bookingTripPassenger.passenger.firstName,
      lastName: bookingTripPassenger.passenger.lastName,
      checkInDateIso:
        bookingTripPassenger.checkInDate?.toISOString() ?? undefined,
      discountType: bookingTripPassenger.discountType,
      referenceNo: bookingTripPassenger.booking.referenceNo,
    };
  }

  convertBookingToVehicleSearchResponse(
    bookingTripVehicle: any
  ): VehicleBookingSearchResponse {
    return {
      bookingId: bookingTripVehicle.booking.id,
      tripId: bookingTripVehicle.trip.id,
      vehicleId: bookingTripVehicle.vehicle.id,
      bookingStatus: bookingTripVehicle.booking.bookingStatus,
      tripDepartureDateIso: bookingTripVehicle.trip.departureDate.toISOString(),
      tripSrcPortName: bookingTripVehicle.trip.srcPort.name,
      tripDestPortName: bookingTripVehicle.trip.destPort.name,
      modelName: bookingTripVehicle.vehicle.modelName,
      plateNo: bookingTripVehicle.vehicle.plateNo,
      modelYear: bookingTripVehicle.vehicle.modelYear,
      checkInDateIso:
        bookingTripVehicle.checkInDate?.toISOString() ?? undefined,
      referenceNo: bookingTripVehicle.booking.referenceNo,
    };
  }

  convertAttachmentBookingDetails(){
    
  }

  convertTripPassengerToEntityForCreation(
    tripPassenger: IBookingTripPassenger,
    loggedInAccount: IAccount
  ): Prisma.BookingTripPassengerCreateArgs {
    return {
      data: {
        meal: tripPassenger.meal ?? null,
        checkInDate: null,
        booking: {
          connect: {
            id: tripPassenger.bookingId,
          },
        },
        trip: {
          connect: {
            id: tripPassenger.tripId,
          },
        },
        bookingTrip: {
          connectOrCreate: {
            where: {
              bookingId_tripId: {
                bookingId: tripPassenger.bookingId,
                tripId: tripPassenger.tripId,
              },
            },
            create: {
              booking: {
                connect: {
                  id: tripPassenger.bookingId,
                },
              },
              trip: {
                connect: {
                  id: tripPassenger.tripId,
                },
              },
            },
          },
        },
        passenger: {
          connect: {
            id: tripPassenger.passengerId,
          },
        },
        seat: tripPassenger.seatId
          ? {
              connect: {
                id: tripPassenger.seatId,
              },
            }
          : undefined,
        cabin: {
          connect: {
            id: tripPassenger.cabinId,
          },
        },
        tripCabin: {
          connect: {
            tripId_cabinId: {
              tripId: tripPassenger.tripId,
              cabinId: tripPassenger.cabinId,
            },
          },
        },
        totalPrice: tripPassenger.totalPrice ?? 0,
        priceWithoutMarkup: tripPassenger.priceWithoutMarkup ?? 0,
        discountType: tripPassenger.discountType ?? null,
        bookingPaymentItems: {
          createMany: {
            data: tripPassenger.bookingPaymentItems.map((paymentItem) => ({
              price: paymentItem.price,
              description: paymentItem.description,
              type: paymentItem.type,
              createdByAccountId: loggedInAccount.id,
              createdAt: new Date(),
            })),
          },
        },
      },
    };
  }

  convertTripVehicleToEntityForCreation(
    tripVehicle: IBookingTripVehicle,
    loggedInAccount: IAccount
  ): Prisma.BookingTripVehicleCreateArgs {
    return {
      data: {
        checkInDate: null,
        booking: {
          connect: {
            id: tripVehicle.bookingId,
          },
        },
        trip: {
          connect: {
            id: tripVehicle.tripId,
          },
        },
        bookingTrip: {
          connectOrCreate: {
            where: {
              bookingId_tripId: {
                bookingId: tripVehicle.bookingId,
                tripId: tripVehicle.tripId,
              },
            },
            create: {
              booking: {
                connect: {
                  id: tripVehicle.bookingId,
                },
              },
              trip: {
                connect: {
                  id: tripVehicle.tripId,
                },
              },
            },
          },
        },
        vehicle: {
          connect: {
            id: tripVehicle.vehicleId,
          },
        },
        totalPrice: tripVehicle.totalPrice ?? 0,
        priceWithoutMarkup: tripVehicle.priceWithoutMarkup ?? 0,
        bookingPaymentItems: {
          createMany: {
            data: tripVehicle.bookingPaymentItems.map((paymentItem) => ({
              price: paymentItem.price,
              description: paymentItem.description,
              type: paymentItem.type,
              createdByAccountId: loggedInAccount.id,
              createdAt: new Date(),
            })),
          },
        },
      },
    };
  }
}
