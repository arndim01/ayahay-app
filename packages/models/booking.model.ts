import {
  PAYMENT_STATUS,
  BOOKING_TYPE,
  BOOKING_STATUS,
  BOOKING_CANCELLATION_TYPE,
} from '@ayahay/constants/enum';
import { IBookingPaymentItem } from './booking-payment-item.model';
import { IAccount } from './account.model';
import { IVoucher } from './voucher.model';
import { IShippingLine } from './shipping-line.model';
import { IBookingTrip } from './booking-trip.model';

export interface IBooking {
  id: string;
  /**
   * we're enforcing that all trips in a booking comes from the
   * same shipping line. this is so complaints, refunds,
   * vouchers, booking approval, and other flows will be handled
   * by the same shipping line
   */
  shippingLineId: number;
  shippingLine?: IShippingLine;
  createdByAccountId?: string;
  createdByAccount?: IAccount;
  approvedByAccountId?: string;
  approvedByAccount?: IAccount;
  voucherCode?: string;
  voucher?: IVoucher;

  referenceNo: string;
  freightRateReceipt?: string;
  bookingStatus: keyof typeof BOOKING_STATUS;
  paymentStatus: keyof typeof PAYMENT_STATUS;
  totalPrice: number;
  priceWithoutMarkup?: number;
  bookingType: keyof typeof BOOKING_TYPE;
  /**
   * The primary email where booking updates
   * (e.g. booking confirmation, trip cancellation)
   * are sent to. If undefined, no emails are sent for this booking
   * (e.g. OTC bookings don't send any emails)
   */
  contactEmail?: string;
  // mobile number (e.g. +63 XXX-YYY-ZZZZ)
  contactMobile?: string;
  createdAtIso: string;
  // indicates if this is or was a booking request
  isBookingRequest: boolean;
  /**
   * if booking status is failed or cancelled,
   * remarks (e.g. reason, actions) are saved here
   */
  failureCancellationRemarks?: string;
  /**
   * if booking is cancelled, this field will help shipping line
   * staff determine how much refund the passenger should get
   * from cancelling the booking. refer to BOOKING_CANCELLATION_TYPE
   * enum declaration for more info
   */
  cancellationType?: keyof typeof BOOKING_CANCELLATION_TYPE;
  /**
   * mostly for BoL (vehicle bookings) purposes only
   * undefined if booking has no vehicles
   */
  consigneeName?: string;
  /**
   * If a booking is a round trip, this field will contain the
   * first trip id (i.e. origin trip). Otherwise, if a booking is
   * a single trip, this field will be null
   */
  firstTripId?: number;
  remarks?: string;

  totalCommission?: number;
  bookingTrips?: IBookingTrip[];
  bookingPaymentItems?: IBookingPaymentItem[];
}
