import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  IPassenger,
  ITrip,
  IAccount,
  IBooking,
  IBookingTrip,
  IVoucher,
  IBookingTripVehicle,
  IBookingTripPassenger,
} from '@ayahay/models';
import { FieldError } from '@ayahay/http';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class BookingValidator {
  private readonly MAX_PASSENGERS_PER_BOOKING = 50;
  private readonly MAX_TRIPS_PER_BOOKING = 10;
  private readonly MAX_VEHICLES_PER_BOOKING = 15;

  constructor(private readonly authService: AuthService) {}

  async validateCreateTentativeBookingRequest(
    booking: IBooking,
    loggedInAccount?: IAccount
  ): Promise<FieldError[]> {
    const errorMessages: FieldError[] = [];
    const trips = booking.bookingTrips
      ?.filter(({ trip }) => trip)
      ?.map(({ trip }) => trip);

    if (booking.bookingTrips === undefined || trips.length === 0) {
      errorMessages.push({
        fieldName: ['bookingTrips'],
        message: 'A booking must have at least one trip.',
      });
      return errorMessages;
    }

    const shippingLineId = trips[0].shippingLineId;
    if (trips.some((trip) => trip.shippingLineId !== shippingLineId)) {
      errorMessages.push({
        fieldName: ['bookingTrips'],
        message: 'All trips must be from the same shipping line',
      });
    }

    if (
      (loggedInAccount === undefined || loggedInAccount.role === 'Passenger') &&
      trips.some((trip) => new Date(trip.bookingCutOffDateIso) < new Date())
    ) {
      errorMessages.push({
        fieldName: ['bookingTrips'],
        message: 'All trip bookings must be before the booking cut-off date',
      });
    }

    if (trips.length > this.MAX_TRIPS_PER_BOOKING) {
      errorMessages.push({
        fieldName: ['bookingTrips'],
        message: `Number of trips for one booking exceeded the maximum of ${this.MAX_TRIPS_PER_BOOKING}`,
      });
    }

    booking.shippingLineId = shippingLineId;

    if (this.authService.isTravelAgencyAccount(loggedInAccount)) {
      const travelAgencyErrors = await this.validateTravelAgencyBooking(
        booking,
        loggedInAccount
      );
      errorMessages.push(...travelAgencyErrors);
    }

    if (this.authService.isShippingLineAccount(loggedInAccount)) {
      errorMessages.push(
        ...this.validateShippingLineBooking(booking, loggedInAccount)
      );
    }

    errorMessages.push(
      ...this.validateBookingTrips(booking.bookingTrips, loggedInAccount),
      ...this.validateVoucher(
        booking.bookingTrips[0].bookingTripVehicles,
        booking.voucher,
        loggedInAccount
      )
    );

    return errorMessages;
  }

  /**
   * Travel Agencies can only make a booking if:
   * 1. They are partnered with the shipping line hosting the trip
   * 2. They use a voucher
   * @param booking
   * @param loggedInAccount
   * @private
   */
  private async validateTravelAgencyBooking(
    booking: IBooking,
    loggedInAccount: IAccount
  ): Promise<FieldError[]> {
    const errorMessages: FieldError[] = [];

    await this.authService.verifyTravelAgencyIsPartneredWithShippingLine(
      loggedInAccount.travelAgencyId,
      booking.shippingLineId
    );
    return errorMessages;
  }

  private validateShippingLineBooking(
    booking: IBooking,
    loggedInAccount?: IAccount
  ): FieldError[] {
    const errorMessages: FieldError[] = [];

    if (loggedInAccount?.role === 'ShippingLineScanner') {
      errorMessages.push({
        fieldName: ['loggedInAccount'],
        message: 'Scanners cannot make bookings',
      });
    }

    if (booking.shippingLineId !== loggedInAccount?.shippingLineId) {
      errorMessages.push({
        fieldName: ['shippingLineId'],
        message: 'You cannot make a booking for another shipping line',
      });
    }

    return errorMessages;
  }

  private validateBookingTrips(
    bookingTrips: IBookingTrip[],
    loggedInAccount?: IAccount
  ): FieldError[] {
    const errorMessages: FieldError[] = [];

    // TODO: check if all trip are existing records
    // TODO: check if all trips are distinct
    bookingTrips.forEach((bookingTrip, index) => {
      const {
        trip,
        bookingTripPassengers: passengers,
        bookingTripVehicles: vehicles,
      } = bookingTrip;

      if (passengers.length === 0 && vehicles.length === 0) {
        errorMessages.push({
          fieldName: ['bookingTrips', index],
          message:
            'A booking trip must have at least one passenger or vehicle.',
        });
      }

      errorMessages.push(
        ...this.validateDrivers(index, passengers, vehicles),
        ...this.validatePassengers(index, passengers, loggedInAccount),
        ...this.validateVehicles(trip, index, vehicles, loggedInAccount),
        ...this.validateTripCapacity(trip, index, passengers, vehicles)
      );
    });

    // TODO: check if vehicle types are supported by all trips
    // TODO: check if any required field from passenger/vehicle is missing

    return errorMessages;
  }

  private validateDrivers(
    tripIndex: number,
    passengers: IBookingTripPassenger[],
    vehicles: IBookingTripVehicle[],
    loggedInAccount?: IAccount
  ): FieldError[] {
    const errorMessages: FieldError[] = [];

    const drivesVehicleIds = new Set<number>();
    passengers
      .filter(({ drivesVehicleId }) => drivesVehicleId)
      .forEach(({ drivesVehicleId }, index) => {
        if (drivesVehicleIds.has(drivesVehicleId)) {
          errorMessages.push({
            fieldName: ['bookingTrips', tripIndex, 'passengers', index],
            message:
              'A vehicle can only be driven by one passenger in one trip',
          });
        }
        drivesVehicleIds.add(drivesVehicleId);

        if (!vehicles.some(({ vehicle }) => vehicle?.id === drivesVehicleId)) {
          errorMessages.push({
            fieldName: ['bookingTrips', tripIndex, 'passengers', index],
            message: 'The driven vehicle must be in the same booking and trip.',
          });
        }
      });

    if (
      drivesVehicleIds.size > 0 &&
      this.authService.hasPrivilegedAccess(loggedInAccount)
    ) {
      errorMessages.push({
        fieldName: ['bookingTrips', tripIndex],
        message: 'Driver selection is not available for staffs',
      });
    }

    return errorMessages;
  }

  private validatePassengers(
    tripIndex: number,
    bookingTripPassengers: IBookingTripPassenger[],
    loggedInAccount?: IAccount
  ): FieldError[] {
    const errorMessages: FieldError[] = [];

    if (bookingTripPassengers.length > this.MAX_PASSENGERS_PER_BOOKING) {
      errorMessages.push({
        fieldName: ['bookingTrips', tripIndex, 'passengers'],
        message: `Number of passengers for one booking trip exceeded the maximum of ${this.MAX_PASSENGERS_PER_BOOKING}`,
      });
    }

    for (let i = 0; i < bookingTripPassengers.length; i++) {
      const passenger = bookingTripPassengers[i].passenger;

      if (passenger === undefined) {
        continue;
      }

      if (loggedInAccount === undefined && this.isPassengerCreated(passenger)) {
        errorMessages.push({
          fieldName: ['bookingTrips', tripIndex, 'bookingTripPassengers', i],
          message: 'A guest booking cannot have an existing passenger.',
        });
      }
    }

    return errorMessages;
  }

  private isPassengerCreated(passenger: IPassenger): boolean {
    return passenger.id > 0;
  }

  private validateVehicles(
    { rateTable }: ITrip,
    tripIndex: number,
    vehicles: IBookingTripVehicle[],
    loggedInAccount?: IAccount
  ): FieldError[] {
    const errorMessages: FieldError[] = [];

    if (vehicles.length > this.MAX_VEHICLES_PER_BOOKING) {
      errorMessages.push({
        fieldName: ['bookingTrips', tripIndex, 'vehicles'],
        message: `Number of vehicles for one booking trip exceeded the maximum of ${this.MAX_VEHICLES_PER_BOOKING}`,
      });
    }

    const availableVehicleTypeIds = new Set<number>();
    const onlineVehicleTypeIds = new Set<number>();
    rateTable.rows
      .filter((rate) => rate.vehicleTypeId)
      .forEach(({ vehicleTypeId, canBookOnline }) => {
        availableVehicleTypeIds.add(vehicleTypeId);

        if (canBookOnline) {
          onlineVehicleTypeIds.add(vehicleTypeId);
        }
      });

    vehicles.forEach(({ vehicle }, index) => {
      const vehicleTypeId = vehicle.vehicleTypeId;
      if (!availableVehicleTypeIds.has(vehicleTypeId)) {
        errorMessages.push({
          fieldName: ['bookingTrips', tripIndex, 'vehicles', index],
          message: `Vehicle type is not available for this trip`,
        });
      }
      if (
        !this.authService.hasPrivilegedAccess(loggedInAccount) &&
        !onlineVehicleTypeIds.has(vehicleTypeId)
      ) {
        errorMessages.push({
          fieldName: ['bookingTrips', tripIndex, 'vehicles', index],
          message: `Vehicle type is not available for online booking`,
        });
      }
    });

    return errorMessages;
  }

  private validateTripCapacity(
    trip: ITrip,
    tripIndex: number,
    passengers: IBookingTripPassenger[],
    vehicles: IBookingTripVehicle[]
  ): FieldError[] {
    const errorMessages = [];

    if (vehicles.length > trip.availableVehicleCapacity) {
      errorMessages.push({
        fieldName: ['bookingTrips', tripIndex],
        message:
          'The number of vehicles for this booking exceeds the available vehicle capacity of this trip.',
      });
    }

    const totalAvailablePassengerCapacity = trip.availableCabins
      .map((tripCabin) => tripCabin.availablePassengerCapacity)
      .reduce(
        (cabinACapacity, cabinBCapacity) => cabinACapacity + cabinBCapacity,
        0
      );

    if (passengers.length > totalAvailablePassengerCapacity) {
      errorMessages.push({
        fieldName: ['bookingTrips', tripIndex],
        message:
          'The number of passengers for this booking exceeds the available passenger capacity of this trip.',
      });
    }

    return errorMessages;
  }

  private validateVoucher(
    bookingTripVehicles: IBookingTripVehicle[],
    voucher?: IVoucher,
    loggedInAccount?: IAccount
  ): FieldError[] {
    const errorMessages = [];

    if (voucher === undefined) {
      return [];
    }

    if (voucher === null) {
      return [
        {
          fieldName: ['voucherCode'],
          message: 'The selected voucher does not exist.',
        },
      ];
    }

    if (new Date() > new Date(voucher.expiryIso)) {
      errorMessages.push({
        fieldName: ['voucherCode'],
        message: 'The selected voucher has expired.',
      });
    }

    if (voucher.remainingUses !== null && voucher.remainingUses <= 0) {
      errorMessages.push({
        fieldName: ['voucherCode'],
        message: 'The selected voucher cannot be used anymore.',
      });
    }

    if (
      !voucher.canBookOnline &&
      !this.authService.hasPrivilegedAccess(loggedInAccount)
    ) {
      errorMessages.push({
        fieldName: ['voucherCode'],
        message: 'The selected voucher cannot be used right now.',
      });
    }

    if (
      voucher.minVehicles !== null &&
      bookingTripVehicles.length < voucher.minVehicles
    ) {
      errorMessages.push({
        fieldName: ['voucherCode'],
        message: 'The selected voucher cannot be applied to your booking.',
      });
    }

    return errorMessages;
  }

  validateBookingWriteAccess(
    booking: { bookingStatus: string; shippingLineId: number },
    loggedInAccount: IAccount
  ): void {
    if (booking.bookingStatus !== 'Confirmed') {
      throw new BadRequestException('Only confirmed bookings can be modified.');
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      booking,
      loggedInAccount
    );
  }

  verifyLoggedInUserHasAccessToBooking(loggedInAccount, booking): void {
    // allow if account is the booking's creator
    if (
      loggedInAccount !== undefined &&
      booking.createdByAccountId === loggedInAccount.id
    ) {
      return;
    }

    // allow if booking was created anonymously
    if (booking.createdByAccountId === null) {
      return;
    }

    try {
      this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
        booking,
        loggedInAccount
      );
      // allow if account has access to booking's shipping line
      return;
    } catch {}

    throw new ForbiddenException();
  }

  async validateRebooking(
    passengerOrVehicle: IBookingTripPassenger | IBookingTripVehicle,
    newBooking: IBooking
  ): Promise<void> {
    if (newBooking.bookingTrips?.length !== 1) {
      throw new BadRequestException('Only 1 trip is allowed for rebooking.');
    }
    const bookingTrip = newBooking.bookingTrips[0];
    if (
      bookingTrip.bookingTripPassengers?.length !== 1 &&
      bookingTrip.bookingTripVehicles?.length !== 1
    ) {
      throw new BadRequestException(
        'Only 1 trip passenger or vehicle is allowed for rebooking.'
      );
    }
    const newTrip = bookingTrip.trip;
    const oldTrip = passengerOrVehicle.trip;
    if (oldTrip.id === newTrip.id) {
      throw new BadRequestException(
        'The old booking and new booking must have different trips.'
      );
    }
    if (
      oldTrip.srcPortId !== newTrip.srcPortId ||
      oldTrip.destPortId !== newTrip.destPortId
    ) {
      throw new BadRequestException(
        'Both the old booking and new booking must have the same origin and destination.'
      );
    }

    if (passengerOrVehicle.removedReason) {
      throw new BadRequestException('Removed passengers cannot be rebooked.');
    }
  }
}
