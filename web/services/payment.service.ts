import { PAYMENT_API } from '@ayahay/constants/api';
import axios from '@ayahay/services/axios';
import {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
} from '@ayahay/http';

export async function startPaymentForBooking(
  tentativeBookingId: number,
  body: PaymentInitiationRequest
): Promise<PaymentInitiationResponse | undefined> {
  try {
    const { data: response } = await axios.post<PaymentInitiationResponse>(
      `${PAYMENT_API}/bookings/${tentativeBookingId}`,
      body
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function startPaymentForBookingRequest(
  bookingId: string
): Promise<PaymentInitiationResponse | undefined> {
  try {
    const { data: response } = await axios.post<PaymentInitiationResponse>(
      `${PAYMENT_API}/bookings/requests/${bookingId}`
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
