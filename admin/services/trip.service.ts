import { IShippingLineSchedule, ITrip, IShip } from '@ayahay/models';
import { TRIP_API } from '@ayahay/constants';
import {
  CancelledTrips,
  CollectOption,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  TripSearchByDateRange,
  UpdateTripCapacityRequest,
  VehicleBookings,
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { fetchAssociatedEntitiesToTrips } from '@ayahay/services/trip.service';
import { isEmpty } from 'lodash';
import { AxiosError } from 'axios';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export async function getAvailableTripsByDateRange(
  shippingLineId: number | undefined,
  searchQuery: PortsAndDateRangeSearch | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<ITrip> | undefined> {
  if (isEmpty(searchQuery) || shippingLineId === undefined) {
    return;
  }

  try {
    const query = new URLSearchParams({
      shippingLineId: shippingLineId.toString(),
      ...searchQuery,
      ...pagination,
    } as any).toString();

    const response = await axios.get(
      `${TRIP_API}/available-by-date-range?${query}`
    );

    if (!response.data) {
      return undefined;
    }

    await fetchAssociatedEntitiesToTrips(response.data.data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getTripsForCollectBooking(
  searchQuery: TripSearchByDateRange | undefined
): Promise<CollectOption[] | undefined> {
  if (isEmpty(searchQuery)) {
    return;
  }

  const query = new URLSearchParams(searchQuery as any).toString();
  const { data: trips } = await axios.get<CollectOption[]>(
    `${TRIP_API}/collect?${query}`
  );

  return trips;
}

export async function getTripDetails(
  tripId: number
): Promise<ITrip | undefined> {
  const { data } = await axios.get<ITrip>(`${TRIP_API}/${tripId}`);
  return data;
}

export async function getVehicleBookingsOfTrip(
  tripId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<VehicleBookings> | undefined> {
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data } = await axios.get<PaginatedResponse<VehicleBookings>>(
      `${TRIP_API}/${tripId}/vehicle-bookings?${query}`
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function getCancelledTrips(
  shippingLineId: number | undefined,
  searchQuery: TripSearchByDateRange | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<CancelledTrips> | undefined> {
  if (isEmpty(searchQuery) || shippingLineId === undefined) {
    return;
  }

  const query = new URLSearchParams({
    shippingLineId,
    ...searchQuery,
    ...pagination,
  } as any).toString();

  try {
    const { data } = await axios.get<PaginatedResponse<CancelledTrips>>(
      `${TRIP_API}/cancelled-trips?${query}`
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function createTripsFromSchedules(
  request: CreateTripsFromSchedulesRequest
): Promise<Error | undefined> {
  try {
    console.log(
      'Creating trips with request:',
      JSON.stringify(request, null, 2)
    );
    const { data } = await axios.post<ITrip[]>(
      `${TRIP_API}/from-schedules`,
      request
    );
    console.log('Successfully created trips:', data);
    return undefined;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating trips:', error.message);
      if (error instanceof AxiosError) {
        console.error('Error response:', error.response?.data);
        return error;
      }
      return error;
    }
    console.error('Unknown error creating trips:', error);
    return new Error('Unknown error occurred while creating trips');
  }
}

export async function updateTripCabinCapacity(
  tripId: number,
  request: UpdateTripCapacityRequest
) {
  try {
    await axios.patch(`${TRIP_API}/${tripId}/capacity`, request);
  } catch (e: any) {
    return e;
  }

  return undefined;
}

export async function setTripAsArrived(tripId: number): Promise<void> {
  return axios.patch(`${TRIP_API}/${tripId}/arrived`);
}

export async function cancelTrip(
  tripId: number,
  reason: string
): Promise<void> {
  return axios.patch(`${TRIP_API}/${tripId}/cancel`, { reason });
}

export async function updateTripOnlineBooking(
  tripId: number,
  allowOnlineBooking: boolean
): Promise<void> {
  return axios.patch(`${TRIP_API}/${tripId}/online-booking`, {
    allowOnlineBooking,
  });
}

export async function updateTripVessel(
  tripId: number,
  shipId: number,
  rateTableId: number
): Promise<void> {
  return axios.patch(
    `${TRIP_API}/${tripId}/ship/${shipId}/rateTable/${rateTableId}`
  );
}

export async function getRateTableForShip(
  shipId: number
): Promise<number | undefined> {
  try {
    const { data } = await axios.get(`${TRIP_API}/ship/${shipId}/rate-table`);

    if (!data || !data.rateTableId) {
      return undefined;
    }

    return data.rateTableId;
  } catch (error) {
    throw error;
  }
}

export async function getTripShip(
  shipId: number,
  shippingLineId: number
): Promise<IShip | undefined> {
  try {
    const response = await axios.get<IShip>(
      `${TRIP_API}/ship/${shipId}/shipping-line/${shippingLineId}`
    );

    if (!response.data) {
      return undefined;
    }

    return response.data;
  } catch (e: any) {
    return undefined;
  }
}

export async function validateTrips(
  request: CreateTripsFromSchedulesRequest
): Promise<{
  valid: boolean;
  errors?: { scheduleId: number; message: string }[];
}> {
  try {
    console.log(
      'Validating trips with request:',
      JSON.stringify(request, null, 2)
    );
    const { data } = await axios.post(`${TRIP_API}/validate`, request);
    console.log('Validation result:', data);
    return data;
  } catch (error) {
    console.error('Error validating trips:', error);
    if (error instanceof AxiosError && error.response?.data) {
      return {
        valid: false,
        errors: [
          {
            scheduleId: 0,
            message: error.response.data.message || 'Unknown error',
          },
        ],
      };
    }
    return {
      valid: false,
      errors: [
        {
          scheduleId: 0,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    };
  }
}
