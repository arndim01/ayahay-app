import { BOOKING_API } from '@ayahay/constants';
import axios from '@ayahay/services/axios';

interface QuickBookingPayload {
  tripId: number;
  passengers: {
    type: string;
    count: number;
  }[];
  totalPrice: number;
  createdByAccountId: string;
}

export async function createQuickBooking(
  payload: QuickBookingPayload
): Promise<any> {
  try {
    console.log('Sending quick booking request:', payload);
    const { data } = await axios.post(`${BOOKING_API}/quick-booking`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Quick booking response:', data);
    return data;
  } catch (error: any) {
    console.error('Quick booking error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function getTripRates(tripId: number): Promise<any> {
  try {
    const { data } = await axios.get(`${BOOKING_API}/trips/${tripId}/rates`);
    return data;
  } catch (error: any) {
    throw error;
  }
}
