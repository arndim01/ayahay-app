import { BOOKING_API } from '@ayahay/constants';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerBookingSearchResponse,
} from '@ayahay/http';
import { VehicleBookingSearchResponse } from '@ayahay/http/booking';
import { IBooking,
  IBookingTripPassenger,
  IBookingTripVehicle
} from '@ayahay/models';
import axios from '@ayahay/services/axios';
import { getVehicleType } from '@ayahay/services/vehicle-type.service';
import { getShippingLines } from '@ayahay/services/shipping-line.service';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';
import { firebase } from '@/app/utils/initFirebase';
import dayjs from 'dayjs';

export async function getBookingPassengersToDownload(
  month: number,
  year: number
): Promise<IBooking[]> {
  const date = dayjs(`${month + 1}/1/${year}`);
  const startDate = date.startOf('month').toISOString();
  const endDate = date.endOf('month').toISOString();
  const { data } = await axios.get<IBooking[]>(
    `${BOOKING_API}/passenger/download`,
    {
      params: { startDate, endDate },
    }
  );
  return data;
}

export async function getBookingVehiclesToDownload(
  month: number,
  year: number
): Promise<IBooking[]> {
  const date = dayjs(`${month + 1}/1/${year}`);
  const startDate = date.startOf('month').toISOString();
  const endDate = date.endOf('month').toISOString();
  const { data } = await axios.get<IBooking[]>(
    `${BOOKING_API}/vehicle/download`,
    {
      params: { startDate, endDate },
    }
  );
  return data;
}

export async function getBookingRequests(
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IBooking>> {
  const query = new URLSearchParams(pagination as any).toString();

  const { data: bookings } = await axios.get<PaginatedResponse<IBooking>>(
    `${BOOKING_API}/for-approval?${query}`
  );

  return bookings;
}

export async function approveBookingRequest(
  tempBookingId: number
): Promise<void> {
  return axios.patch(`${BOOKING_API}/requests/${tempBookingId}/approve`);
}

export async function searchPassengerBookings(
  searchQuery: string,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<PassengerBookingSearchResponse>> {
  const query = new URLSearchParams({
    q: searchQuery,
    ...pagination,
  } as any).toString();

  const { data: bookings } = await axios.get<
    PaginatedResponse<PassengerBookingSearchResponse>
  >(`${BOOKING_API}/search/passengers?${query}`);

  return bookings;
}

export async function getBookingRequestById(
  tempBookingId: number
): Promise<IBooking | undefined> {
  const { data: booking } = await axios.get<IBooking>(
    `${BOOKING_API}/requests/${tempBookingId}`
  );

  return booking;
}

export async function searchVehicleBookings(
  searchQuery: string,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<VehicleBookingSearchResponse>> {
  const query = new URLSearchParams({
    q: searchQuery,
    ...pagination,
  } as any).toString();

  const { data: bookings } = await axios.get<
    PaginatedResponse<VehicleBookingSearchResponse>
  >(`${BOOKING_API}/search/vehicles?${query}`);

  return bookings;
}

export async function getBookingById(
  bookingId: string
): Promise<IBooking | undefined> {
  const { data: booking } = await axios.get<IBooking>(
    `${BOOKING_API}/${bookingId}`
  );

  return booking;
}

export async function getBookingTripPassengerById(
  bookingId: string,
  tripId: number,
  passengerId: number
): Promise<IBookingTripPassenger | undefined> {
  const { data: bookingTripPassenger } = await axios.get<IBookingTripPassenger>(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}`
  );

  return bookingTripPassenger;
}

export async function getBookingTripVehicleById(
  bookingId: string,
  tripId: number,
  vehicleId: number
): Promise<IBookingTripVehicle | undefined> {
  const { data: bookingTripVehicle } = await axios.get<IBookingTripVehicle>(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}`
  );

  return bookingTripVehicle;
}

export async function createTentativeBooking(
  tempBooking: IBooking
): Promise<IBooking> {
  if (
    tempBooking.bookingTrips === undefined ||
    tempBooking.bookingTrips.length === 0
  ) {
    throw 'Booking must have at least one trip';
  }

  for (const bookingTrip of tempBooking.bookingTrips) {
    const { bookingTripPassengers: passengers, bookingTripVehicles: vehicles } =
      bookingTrip;
    const vehicleIds = new Set<number>();
    if (vehicles !== undefined) {
      for (let bookingTripVehicle of vehicles) {
        if (bookingTripVehicle.vehicle === undefined) {
          continue;
        }
        vehicleIds.add(bookingTripVehicle.vehicleId);
        // TODO: remove these after file upload has been properly implemented
        bookingTripVehicle.vehicle.certificateOfRegistrationUrl ??= '';
        bookingTripVehicle.vehicle.officialReceiptUrl ??= '';
        bookingTripVehicle.vehicle.modelYear = 0;

        bookingTripVehicle.vehicle.vehicleType = await getVehicleType(
          bookingTripVehicle.vehicle.vehicleTypeId
        );
      }
    }

    if (passengers !== undefined) {
      clearNonExistingVehiclesInPassengers(passengers, vehicleIds);
    }
  }

  const { data: booking } = await axios.post<IBooking>(
    `${BOOKING_API}`,
    tempBooking
  );

  const shippingLines = await getShippingLines();
  const shippingLine = shippingLines?.find(
    ({ id }) => booking.shippingLineId === id
  );
  booking.bookingTrips?.forEach(({ bookingTripPassengers }) =>
    bookingTripPassengers?.forEach((tripPassenger) => {
      if (!tripPassenger?.seat) {
        return;
      }
      tripPassenger.seat.seatType = shippingLine?.seatTypes?.find(
        ({ id }) => tripPassenger.seat?.seatTypeId === id
      );
    })
  );
  return booking;
}

function clearNonExistingVehiclesInPassengers(
  bookingTripPassengers: IBookingTripPassenger[],
  vehicleIds: Set<number>
) {
  for (let bookingTripPassenger of bookingTripPassengers) {
    if (bookingTripPassenger.drivesVehicleId === undefined) {
      continue;
    }
    if (!vehicleIds.has(bookingTripPassenger.drivesVehicleId)) {
      bookingTripPassenger.drivesVehicleId = undefined;
    }
  }
}

export function saveBookingInBrowser(bookingId: string): void {
  const savedBookingIds = fetchItem<string[]>('saved-bookings') ?? [];
  savedBookingIds.push(bookingId);
  const oneMonthInMinutes = 60 * 24 * 30;
  cacheItem('saved-bookings', savedBookingIds, oneMonthInMinutes);
}

export async function requestBooking(
  tentativeBookingId: number,
  contactEmail?: string
): Promise<IBooking | undefined> {
  try {
    const { data: response } = await axios.patch<IBooking>(
      `${BOOKING_API}/requests/${tentativeBookingId}/create`,
      contactEmail ? { email: contactEmail } : undefined
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getMyBookings(
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IBooking> | undefined> {
  const authToken = await firebase.currentUser?.getIdToken();
  if (authToken === undefined) {
    return {
      total: 0,
      data: [],
    };
  }

  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data: bookings } = await axios.get<PaginatedResponse<IBooking>>(
      `${BOOKING_API}/mine?${query}`
    );

    return bookings;
  } catch (e) {
    console.error(e);
    return {
      total: 0,
      data: [],
    };
  }
}

export async function getSavedBookingsInBrowser(): Promise<IBooking[]> {
  const savedBookingIds = fetchItem<string[]>('saved-bookings') ?? [];
  if (savedBookingIds.length === 0) {
    return [];
  }

  try {
    const commaSeparatedBookingIds = savedBookingIds.join(',');
    const { data: bookings } = await axios.get<IBooking[]>(
      `${BOOKING_API}/public?ids=${commaSeparatedBookingIds}`
    );

    return bookings;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const getBookingLogs = async (
  pagination: PaginatedRequest,
  shippingLineId?: number,
  selectedStatus?: string,
  bookingType?: string,
  search?: string
): Promise<PaginatedResponse<IBooking>> => {
  const params = new URLSearchParams();
  params.append('page', pagination.page.toString());
  if (selectedStatus) params.append('status', selectedStatus);
  if (bookingType && bookingType !== 'All') params.append('bookingType', bookingType);
  if (shippingLineId) params.append('shippingLineId', shippingLineId.toString());
  if (search) params.append('search', search);

  const response = await axios.get(`${BOOKING_API}/logs?${params.toString()}`);
  return response.data;
};