import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import {
  IBooking,
  IBookingTrip,
  IBookingTripPassenger,
  IBookingTripVehicle,
  ICabinType,
  IPassenger,
  ITripCabin,
  IVehicle,
} from '@ayahay/models';
import { AvailableBooking } from './booking.types';
import { VoucherService } from '@/voucher/voucher.service';
import { EmailService } from '@/email/email.service';
import { BookingMapper } from '@/booking/booking.mapper';
import { PassengerService } from '@/passenger/passenger.service';
import { VehicleService } from '@/vehicle/vehicle.service';
import { UtilityService } from '@/utility.service';
import { BookingWebhookService } from '@/booking/booking-webhook.service';
import { AccountService } from '@/account/account.service';

@Injectable()
export class BookingReservationService {
  // if one seat has preferred cabin and another has preferred seat type,
  // we want to prioritize cabin preference
  private readonly CORRECT_CABIN_WEIGHT = 100;
  private readonly CORRECT_SEAT_TYPE_WEIGHT = 10;
  private readonly HAS_SEAT_WEIGHT = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingMapper: BookingMapper,
    private readonly voucherService: VoucherService,
    private readonly emailService: EmailService,
    private readonly passengerService: PassengerService,
    private readonly vehicleService: VehicleService,
    private readonly utilityService: UtilityService,
    private readonly bookingWebhookService: BookingWebhookService
  ) {}

  /**
   * Assigns cabin and seat information for all passengers
   * in a booking
   * @param bookingTrips
   */
  async assignCabinsAndSeatsToPassengers(
    bookingTrips: IBookingTrip[]
  ): Promise<void> {
    const tripsWithSeatSelection = bookingTrips.filter((bookingTrip) =>
      bookingTrip.trip.availableCabins.some((tripCabin) => tripCabin.seatPlanId)
    );
    const tripsWithoutSeatSelection = bookingTrips.filter((bookingTrip) =>
      bookingTrip.trip.availableCabins.every(
        (tripCabin) => !tripCabin.seatPlanId
      )
    );

    tripsWithoutSeatSelection.forEach((bookingTrip) =>
      this.assignCabinsToPassengersInTripWithoutSeatSelection(bookingTrip)
    );

    await this.assignCabinsAndSeatsToPassengersInTripsWithSeatSelection(
      tripsWithSeatSelection
    );
  }

  private assignCabinsToPassengersInTripWithoutSeatSelection(
    bookingTrip: IBookingTrip
  ): void {
    // TODO: sort cabins

    bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
      const bestBooking = this.getBestBooking(
        this.getAvailableCabinBookings(bookingTrip),
        bookingTripPassenger
      );
      if (bestBooking === undefined) {
        throw new BadRequestException('No available bookings');
      }
      const assignedCabinIndex = bookingTrip.trip.availableCabins.findIndex(
        ({ tripId, cabinId }) =>
          bestBooking.tripId === tripId && bestBooking.cabinId === cabinId
      );

      this.assignCabinToPassenger(
        bookingTrip,
        bookingTripPassenger,
        assignedCabinIndex
      );
    });
  }

  private getAvailableCabinBookings(
    bookingTrip: IBookingTrip
  ): AvailableBooking[] {
    return bookingTrip.trip.availableCabins
      .filter((tripCabin) => tripCabin.availablePassengerCapacity > 0)
      .map(
        ({ tripId, cabinId, availablePassengerCapacity }) =>
          ({
            tripId,
            cabinId,
            availablePassengerCapacity,
          } as AvailableBooking)
      );
  }

  private assignCabinToPassenger(
    // we pass bookingTrip because we mutate its trip.availableCabins property
    bookingTrip: IBookingTrip,
    bookingTripPassenger: IBookingTripPassenger,
    assignedCabinIndex: number
  ): void {
    const assignedCabin = bookingTrip.trip.availableCabins[assignedCabinIndex];

    bookingTripPassenger.cabinId = assignedCabin.cabinId;
    bookingTripPassenger.cabin = assignedCabin.cabin;

    bookingTrip.trip.availableCabins[assignedCabinIndex]
      .availablePassengerCapacity--;
  }

  private async assignCabinsAndSeatsToPassengersInTripsWithSeatSelection(
    bookingTrips: IBookingTrip[]
  ): Promise<void> {
    if (bookingTrips.length === 0) {
      return;
    }

    const availableSeatBookings = await this.getAvailableSeatBookings(
      bookingTrips
    );

    bookingTrips.forEach((bookingTrip) => {
      const availableSeatBookingsInThisTrip = availableSeatBookings.filter(
        (seat) => seat.tripId === bookingTrip.tripId
      );
      bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
        const availableCabinBookings =
          this.getAvailableCabinBookings(bookingTrip);
        const availableCabinIds = availableCabinBookings.map(
          ({ cabinId }) => cabinId
        );
        const availableSeatBookingsInAvailableCabins =
          availableSeatBookingsInThisTrip.filter((booking) =>
            availableCabinIds.includes(booking.cabinId)
          );

        const availableBookingsInThisTrip = [
          ...availableCabinBookings,
          ...availableSeatBookingsInAvailableCabins,
        ];

        const bestBooking = this.getBestBooking(
          availableBookingsInThisTrip,
          bookingTripPassenger
        );
        if (bestBooking === undefined) {
          throw new BadRequestException();
        }

        const assignedCabinIndex = bookingTrip.trip.availableCabins.findIndex(
          (tripCabin) => tripCabin.cabinId === bestBooking.cabinId
        );
        this.assignCabinToPassenger(
          bookingTrip,
          bookingTripPassenger,
          assignedCabinIndex
        );

        if (bestBooking.seatId) {
          bookingTripPassenger.seatId = bestBooking.seatId;
          bookingTripPassenger.seat = {
            id: bestBooking.seatId,
            seatTypeId: bestBooking.seatTypeId,
            name: bestBooking.seatName,
          } as any;

          const bestSeatBookingIndex =
            availableSeatBookingsInThisTrip.findIndex(
              ({ cabinId, seatId }) =>
                bestBooking.cabinId === cabinId && bestBooking.seatId === seatId
            );
          // if seat booking, remove seat from the available seats for next passengers
          availableSeatBookingsInThisTrip.splice(bestSeatBookingIndex, 1);
        }
      });
    });
  }

  /**
   * if we have 5 passengers in one booking for one trip, we get 5
   * available seats for each seat type (e.g. get 5 window seats,
   * 5 aisle seats, etc). this way, we handle the worst case scenario
   * (all 5 passengers want the same seat type)
   */
  private async getAvailableSeatBookings(
    bookingTrips: IBookingTrip[]
  ): Promise<AvailableBooking[]> {
    let maxPassengerCount = 0;
    bookingTrips.forEach((bookingTrip) => {
      if (bookingTrip.bookingTripPassengers.length > maxPassengerCount) {
        maxPassengerCount = bookingTrip.bookingTripPassengers.length;
      }
    });

    const tripIds = bookingTrips.map((bookingTrip) => bookingTrip.tripId);

    return this.prisma.$queryRaw<AvailableBooking[]>`
SELECT "tripId", "cabinId", "seatId", "seatName", "seatTypeId"
FROM (
  SELECT 
    tc.trip_id AS "tripId",
    tc.cabin_id AS "cabinId",
    s.id AS "seatId",
    s."name" AS "seatName",
    s.seat_type_id AS "seatTypeId",
    ROW_NUMBER() OVER (
      PARTITION BY t.id, tc.cabin_id, s.seat_type_id
      ORDER BY s."name"
    ) AS row
  FROM ayahay.trip t
  LEFT JOIN ayahay.trip_cabin tc ON t.id = tc.trip_id
  INNER JOIN ayahay.seat_plan sp ON tc.seat_plan_id = sp.id
  LEFT JOIN ayahay.seat s ON sp.id = s.seat_plan_id
  WHERE ( 
    tc.trip_id IN (${Prisma.join(tripIds)})
    AND tc.seat_plan_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 
      FROM ayahay.booking_trip_passenger btp 
      WHERE 
        btp.trip_id = tc.trip_id
        AND btp.cabin_id = tc.cabin_id
        AND btp.seat_id = s.id
    )
  )
  ORDER BY s."name"
) partitioned_results
WHERE row <= ${maxPassengerCount}
;
`;
  }

  private getBestBooking(
    availableBookings: AvailableBooking[],
    bookingTripPassenger: IBookingTripPassenger
  ): AvailableBooking | undefined {
    if (availableBookings.length === 0) {
      return undefined;
    }

    // score that determines how "preferred" a seat is; the higher, the more preferred
    let bestScore = -1;
    let bestBooking: AvailableBooking;

    availableBookings.forEach((booking) => {
      let currentSeatScore = 0;
      if (booking.cabinId === bookingTripPassenger.preferredCabinId) {
        currentSeatScore += this.CORRECT_CABIN_WEIGHT;
      }
      if (
        bookingTripPassenger.preferredSeatTypeId !== undefined &&
        booking.seatTypeId === bookingTripPassenger.preferredSeatTypeId
      ) {
        currentSeatScore += this.CORRECT_SEAT_TYPE_WEIGHT;
      }
      if (booking.seatId !== undefined) {
        currentSeatScore += this.HAS_SEAT_WEIGHT;
      }

      if (currentSeatScore > bestScore) {
        bestScore = currentSeatScore;
        bestBooking = booking;
      }
    });

    return bestBooking;
  }

  async saveConfirmedBooking(
    booking: IBooking,
    transactionContext: PrismaClient
  ): Promise<IBooking> {
    await this.saveNewPassengersAndVehicles(
      booking.bookingTrips,
      transactionContext
    );

    const bookingToCreate =
      this.bookingMapper.convertBookingToEntityForCreation(booking);
    const bookingEntity = await transactionContext.booking.create(
      bookingToCreate
    );

    await this.onBookingConfirmation(booking, transactionContext);

    return this.bookingMapper.convertBookingToBasicDto(bookingEntity);
  }

  private async saveNewPassengersAndVehicles(
    bookingTrips: IBookingTrip[],
    transactionContext: PrismaClient
  ): Promise<void> {
    // all trips of the same booking have the same passengers and vehicles,
    // so we just get passengers and vehicles of the first trip
    const passengerIdMap = await this.saveNewPassengers(
      bookingTrips[0].bookingTripPassengers.map(({ passenger }) => passenger),
      transactionContext
    );
    const vehicleIdMap = await this.saveNewVehicles(
      bookingTrips[0].bookingTripVehicles.map(({ vehicle }) => vehicle),
      transactionContext
    );

    bookingTrips.forEach((bookingTrip) => {
      this.updateOldPassengerAndVehicleIdsInBookingTrip(
        bookingTrip,
        passengerIdMap,
        vehicleIdMap
      );
    });
  }

  /**
   * Temp bookings can have passengers and vehicles
   * not present in the DB yet, so their IDs are negative.
   * Assuming we have already created DB entries for them
   * and mapped their old negative IDs to their new counterpart,
   * this function updates the negative IDs in all booking items
   * @param bookingTrip
   * @param passengerIdMap
   * @param vehicleIdMap
   * @private
   */
  private updateOldPassengerAndVehicleIdsInBookingTrip(
    bookingTrip: IBookingTrip,
    passengerIdMap: Map<number, number>,
    vehicleIdMap: Map<number, number>
  ): void {
    bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
      const newPassengerId = passengerIdMap[bookingTripPassenger.passengerId];
      const newVehicleId = vehicleIdMap[bookingTripPassenger.drivesVehicleId];

      if (!(bookingTripPassenger.passengerId > 0)) {
        bookingTripPassenger.passengerId = newPassengerId;
      }
      bookingTripPassenger.bookingPaymentItems
        .filter((bookingPaymentItem) => !(bookingPaymentItem.passengerId > 0))
        .forEach(
          (bookingPaymentItem) =>
            (bookingPaymentItem.passengerId = newPassengerId)
        );
      if (!(bookingTripPassenger.drivesVehicleId > 0)) {
        bookingTripPassenger.drivesVehicleId = newVehicleId;
      }
    });

    bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
      const newVehicleId = vehicleIdMap[bookingTripVehicle.vehicleId];

      if (!(bookingTripVehicle.vehicleId > 0)) {
        bookingTripVehicle.vehicleId = newVehicleId;
      }
      bookingTripVehicle.bookingPaymentItems
        .filter((bookingPaymentItem) => !(bookingPaymentItem.vehicleId > 0))
        .forEach(
          (bookingPaymentItem) => (bookingPaymentItem.vehicleId = newVehicleId)
        );
    });
  }

  // creates the passengers in booking with ID -1
  // returns the old ID -> new ID map of created passengers
  private async saveNewPassengers(
    passengers: IPassenger[],
    transactionContext?: PrismaClient
  ): Promise<Map<number, number>> {
    transactionContext ??= this.prisma;

    const oldIdToNewIdMap = new Map<number, number>();

    await Promise.all(
      passengers.map(async (passenger) => {
        // if passenger already has an ID, do nothing
        if (passenger.id > 0) {
          return passenger.id;
        }
        const createdPassenger = await this.passengerService.createPassenger(
          passenger,
          transactionContext
        );

        oldIdToNewIdMap[passenger.id] = createdPassenger.id;
      })
    );

    return oldIdToNewIdMap;
  }

  // creates the vehicles in booking with ID -1
  // returns the created vehicles' ID with the same order as BookingVehicles in booking
  private async saveNewVehicles(
    vehicles: IVehicle[],
    transactionContext?: PrismaClient
  ): Promise<Map<number, number>> {
    transactionContext ??= this.prisma;

    const oldIdToNewIdMap = new Map<number, number>();

    await Promise.all(
      vehicles.map(async (vehicle) => {
        // if vehicle already has an ID, do nothing
        if (vehicle.id > 0) {
          return;
        }

        const createdVehicle = await this.vehicleService.createVehicle(
          vehicle,
          transactionContext
        );

        oldIdToNewIdMap[vehicle.id] = createdVehicle.id;
      })
    );

    return oldIdToNewIdMap;
  }

  private async onBookingConfirmation(
    booking: IBooking,
    transactionContext: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    await this.updateTripsCapacities(
      booking.bookingTrips,
      'decrement',
      transactionContext
    );

    await this.voucherService.useVoucher(
      booking.voucherCode,
      transactionContext
    );

    // if (
    //   booking.contactEmail !== null
    // ) {
    //   // we fire and forget; this operation will not affect the rest of the workflow
    //   this.emailService.sendBookingConfirmedEmail({
    //     recipient: booking.contactEmail,
    //     bookingId: booking.id,
    //   });
    // }

    this.bookingWebhookService.notifyBookingCreateWebhooks(booking);
  }

  async updateTripsCapacities(
    bookingTrips: IBookingTrip[],
    operation: 'increment' | 'decrement',
    transactionContext: PrismaClient
  ): Promise<void> {
    const { bookingTripPassengers, bookingTripVehicles } =
      this.utilityService.combineAllBookingTripEntities(bookingTrips);

    await this.updatePassengerCapacities(
      bookingTripPassengers,
      operation,
      transactionContext
    );
    await this.updateVehicleCapacities(
      bookingTripVehicles,
      operation,
      transactionContext
    );
  }

  async updatePassengerCapacities(
    bookingTripPassengers: IBookingTripPassenger[],
    operation: 'increment' | 'decrement',
    transactionContext: PrismaClient
  ): Promise<void> {
    const tripCabinPassengerCount: {
      [tripId: number]: {
        [cabinId: number]: number;
      };
    } = {};

    bookingTripPassengers.forEach(({ tripId, cabinId, removedReason }) => {
      if (typeof removedReason === 'string') {
        // a String typed removedReason means that the passenger is voided beforehand
        // allowing a void passenger will result to an incorrect availalbe_passenger_capacity
        return;
      }

      if (tripCabinPassengerCount[tripId] === undefined) {
        tripCabinPassengerCount[tripId] = {};
      }

      if (!tripCabinPassengerCount[tripId][cabinId]) {
        tripCabinPassengerCount[tripId][cabinId] = 1;
      } else {
        tripCabinPassengerCount[tripId][cabinId]++;
      }
    });

    for (const tripIdStr of Object.keys(tripCabinPassengerCount)) {
      for (const cabinIdStr of Object.keys(
        tripCabinPassengerCount[tripIdStr]
      )) {
        const tripId = Number(tripIdStr);
        const cabinId = Number(cabinIdStr);

        let passengerCount = tripCabinPassengerCount[tripId][cabinId];

        if (operation === 'decrement') {
          passengerCount = -passengerCount;
        }

        await transactionContext.tripCabin.update({
          where: {
            tripId_cabinId: {
              tripId,
              cabinId,
            },
          },
          data: {
            availablePassengerCapacity: {
              increment: passengerCount,
            },
          },
        });
      }
    }
  }

  async updateVehicleCapacities(
    bookingTripVehicles: IBookingTripVehicle[],
    operation: 'increment' | 'decrement',
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const tripVehicleCount: {
      [tripId: number]: number;
    } = {};

    bookingTripVehicles.forEach(({ tripId }) => {
      if (!tripVehicleCount[tripId]) {
        tripVehicleCount[tripId] = 1;
      } else {
        tripVehicleCount[tripId]++;
      }
    });

    for (const tripIdStr of Object.keys(tripVehicleCount)) {
      const tripId = Number(tripIdStr);

      let vehicleCount = tripVehicleCount[tripId];

      if (operation === 'decrement') {
        vehicleCount = -vehicleCount;
      }

      await transactionContext.trip.update({
        where: {
          id: tripId,
        },
        data: {
          availableVehicleCapacity: {
            increment: vehicleCount,
          },
        },
      });
    }
  }
}
