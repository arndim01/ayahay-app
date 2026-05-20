import { IBooking } from './booking.model';
import { IPassenger } from './passenger.model';
import { ISeat } from './seat.model';
import { ITrip } from './trip.model';
import { ICabin } from './cabin.model';
import { IBookingPaymentItem } from './booking-payment-item.model';
import { IBookingTripVehicle } from './booking-trip-vehicle.model';
import { ISeatType } from './seat-type.model';
import { ITripCabin } from './trip-cabin.model';
import { BOOKING_CANCELLATION_TYPE, DISCOUNT_TYPE } from '@ayahay/constants';

export interface IBookingTripPassenger {
  bookingId: string;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  passengerId: number;
  passenger?: IPassenger;
  preferredSeatTypeId?: number;
  preferredSeatType?: ISeatType;
  cabinId: number;
  cabin?: ICabin;
  tripCabin?: ITripCabin;
  /**
   * if the booking trip allows for seat selection, a
   * passenger will also be assigned a seat in the
   * cabin above.
   */
  seatId?: number;
  seat?: ISeat;
  /**
   * a passenger can choose to be a driver of a vehicle
   * in the same booking and same trip. if they are
   * a driver, their ticket fare will be reduced to 0
   * for that booking and trip
   */
  drivesVehicleId?: number;
  drivesVehicle?: IBookingTripVehicle;
  preferredCabinId?: number;
  preferredCabin?: ICabin;

  meal?: string;
  totalPrice?: number;
  priceWithoutMarkup?: number;
  priceWithCommission?: number;
  commissionAmount?: number;
  checkInDate?: string;
  /**
   * has a value if passenger is removed from the booking
   * otherwise this is undefined (or NULL in the DB)
   */
  removedReason?: string;
  // see IBooking.cancellationReasonType
  removedReasonType?: keyof typeof BOOKING_CANCELLATION_TYPE;
  discountType?: keyof typeof DISCOUNT_TYPE;

  bookingPaymentItems?: IBookingPaymentItem[];
}
