import { IBooking } from './booking.model';
import { IVehicle } from './vehicle.model';
import { ITrip } from './trip.model';
import { IBookingPaymentItem } from './booking-payment-item.model';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';

export interface IBookingTripVehicle {
  bookingId: string;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  vehicleId: number;
  vehicle?: IVehicle;

  totalPrice?: number;
  priceWithoutMarkup?: number;
  priceWithCommission?: number;
  commissionAmount?: number;
  checkInDate?: string;
  removedReason?: string;
  removedReasonType?: keyof typeof BOOKING_CANCELLATION_TYPE;
  bookingPaymentItems?: IBookingPaymentItem[];
}
