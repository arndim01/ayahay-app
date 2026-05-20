import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Trip } from './trip.specs';
import { FieldError } from '@ayahay/http';

export class CreateBookingRequest {
  bookingTrips: RequestTrip[];
  /**
   * The voucher to use for this booking.
   */
  voucherCode?: string;
}

class RequestTrip {
  tripId: number;
  bookingTripPassengers: RequestTripPassenger[];
  bookingTripVehicles: RequestTripVehicle[];
}

class RequestTripPassenger {
  /**
   * The type of discount this passenger is eligible for this booking.
   * Possible values are: Adult, Student, Senior, PWD, Child, and Infant
   */
  discountType: string;

  /**
   * The ID of the vehicle this passenger will be driving.
   */
  drivesVehicleId: number;
  /**
   * Leave blank if this is an existing passenger in the system
   */
  passenger?: RequestPassenger;
  /**
   * If this is an existing passenger in the system, set this
   * ID to the passenger's ID.
   * Leave blank if this is a new passenger in the system.
   */
  passengerId?: number;
  /**
   * Optional. The preferred accommodation of this passenger for this trip.
   */
  preferredCabinId?: number;
}

class RequestPassenger {
  address: string;
  birthdayIso: string;
  buddyId: number;
  firstName: string;
  /**
   * The temporary ID of this passenger. This number identifies this passenger
   * throughout this booking. This should be a negative number.
   */
  id: number;
  lastName: string;
  nationality: string;
  occupation: string;
  sex: string;
}

class RequestTripVehicle {
  /**
   * Leave blank if this is an existing vehicle in the system
   */
  vehicle?: RequestVehicle;
  /**
   * If this is an existing vehicle in the system, set this
   * ID to the vehicle's ID.
   * Leave blank if this is a new passenger in the system.
   */
  vehicleId?: number;
}

class RequestVehicle {
  /**
   * The temporary ID of this vehicle. This number identifies this vehicle
   * throughout this booking (e.g. drivesVehicleId should refer to this).
   * This should be a negative number.
   */
  id: number;
  /**
   * @example ['Toyota Innova']
   */
  modelName: string;
  modelYear: number;
  plateNo: string;
  /**
   * The type of this vehicle.
   */
  vehicleTypeId: number;
}

class ResponseTripVehicle extends RequestTripVehicle {
  vehicleId: number;
  /**
   * The payment items for this vehicle in this trip
   */
  paymentItems: PaymentItem[];
}

class PaymentItem {
  price: number;
  description: string;
}

class ResponseTripPassenger extends RequestTripPassenger {
  passengerId: number;
  /**
   * The payment items for this passenger in this trip
   */
  paymentItems: PaymentItem[];
}

class ResponseTrip extends RequestTrip {
  @ApiProperty({ type: ResponseTripPassenger })
  bookingTripPassengers: ResponseTripPassenger[];
  @ApiProperty({ type: ResponseTripVehicle })
  bookingTripVehicles: ResponseTripVehicle[];
  trip: Trip;
}

export class CreateBookingResponse extends CreateBookingRequest {
  @ApiProperty({ type: ResponseTrip })
  bookingTrips: ResponseTrip[];
  /**
   * The temporary ID of the booking. Use this ID to confirm
   * this booking at POST /pay/bookings/:tempBookingId.
   */
  id: string;
  totalPrice: number;
}

export class CreateBookingError implements FieldError {
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ type: 'number' }, { type: 'string' }],
    },
  })
  fieldName: (string | number)[];
  message: string;
}

export class ConfirmBookingResponse {
  @ApiProperty({ description: 'The URL to the created booking.' })
  redirectUrl: string;
}
