import { IAccount } from './account.model';
import { IBookingTripPassenger } from './booking-trip-passenger.model';
import { IBookingTripVehicle } from './booking-trip-vehicle.model';
import { IBooking } from './booking.model';
import { ITrip } from './trip.model';
import { BOOKING_PAYMENT_ITEM_TYPE } from '@ayahay/constants';

export interface IBookingPaymentItem {
  id: number;
  bookingId: string;
  booking?: IBooking;
  createdByAccountId?: string;
  createdByAccount?: IAccount;
  tripId?: number;
  trip?: ITrip;
  passengerId?: number;
  bookingTripPassenger?: IBookingTripPassenger;
  vehicleId?: number;
  bookingTripVehicle?: IBookingTripVehicle;

  price: number;
  description: string;
  type?: keyof typeof BOOKING_PAYMENT_ITEM_TYPE;
}
