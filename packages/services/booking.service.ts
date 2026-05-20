import {
  IBooking,
  IBookingPaymentItem,
  IBookingTrip,
  IPassenger,
  IVehicle,
} from '@ayahay/models';
import axios from './axios';
import { BOOKING_API, BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';
import { FormInstance } from 'antd';

export async function cancelBooking(
  bookingId: string,
  remarks: string,
  reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
): Promise<void> {
  return axios.patch(`${BOOKING_API}/${bookingId}/cancel`, {
    remarks,
    reasonType,
  });
}

export async function checkInPassenger(
  bookingId: string,
  tripId: number,
  passengerId: number
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}/check-in`
  );
}

export async function removeTripPassenger(
  bookingId: string,
  tripId: number,
  passengerId: number,
  removedReason: string,
  reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}/remove`,
    { removedReason, reasonType }
  );
}

export async function removeTripVehicle(
  bookingId: string,
  tripId: number,
  vehicleId: number,
  removedReason: string,
  reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}/remove`,
    { removedReason, reasonType }
  );
}

export async function checkInVehicle(
  bookingId: string,
  tripId: number,
  vehicleId: number
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}/check-in`
  );
}

export function combineBookingPaymentItems(
  booking: IBooking
): IBookingPaymentItem[] {
  const bookingPaymentItems: IBookingPaymentItem[] = [];
  booking.bookingTrips?.forEach((bookingTrip) => {
    const passengerPaymentItems = bookingTrip.bookingTripPassengers
      ? bookingTrip.bookingTripPassengers
          .map(
            (bookingTripPassenger) =>
              bookingTripPassenger.bookingPaymentItems ?? []
          )
          .reduce(
            (passengerAItems, passengerBItems) => [
              ...passengerAItems,
              ...passengerBItems,
            ],
            []
          )
      : [];
    const vehiclePaymentItems = bookingTrip.bookingTripVehicles
      ? bookingTrip.bookingTripVehicles
          .map(
            (bookingTripVehicle) => bookingTripVehicle.bookingPaymentItems ?? []
          )
          .reduce(
            (vehicleAItems, vehicleBItems) => [
              ...vehicleAItems,
              ...vehicleBItems,
            ],
            []
          )
      : [];

    passengerPaymentItems.forEach(
      (paymentItem) => (paymentItem.trip = bookingTrip.trip)
    );
    vehiclePaymentItems.forEach(
      (paymentItem) => (paymentItem.trip = bookingTrip.trip)
    );

    bookingPaymentItems.push(...passengerPaymentItems, ...vehiclePaymentItems);
  });
  bookingPaymentItems.push(...(booking.bookingPaymentItems ?? []));
  return bookingPaymentItems;
}

export function buildPassengerFromForm(form: FormInstance): IPassenger {
  return {
    id: -1,
    firstName: form.getFieldValue('firstName'),
    lastName: form.getFieldValue('lastName'),
    sex: form.getFieldValue('sex'),
    birthdayIso: form.getFieldValue('birthdayIso').toISOString(),
    address: form.getFieldValue('address'),
    nationality: form.getFieldValue('nationality'),
    occupation: form.getFieldValue('occupation'),
    civilStatus: form.getFieldValue('civilStatus'),
  };
}

export function buildVehicleFromForm(form: FormInstance): IVehicle {
  return {
    id: -1,
    plateNo: form.getFieldValue('plateNo'),
    modelName: form.getFieldValue('modelName'),
    modelYear: -1,
    vehicleTypeId: -1,
    officialReceiptUrl: '',
    certificateOfRegistrationUrl: '',
  };
}

export async function updateTripPassenger(
  bookingId: string,
  tripId: number,
  passengerId: number,
  passenger: IPassenger
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}/information`,
    passenger
  );
}

export async function rebookTripPassenger(
  bookingId: string,
  tripId: number,
  passengerId: number,
  tempBookingId: number
): Promise<void> {
  return axios.post(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}/rebook`,
    { tempBookingId }
  );
}

export async function updateTripVehicle(
  bookingId: string,
  tripId: number,
  vehicleId: number,
  vehicle: IVehicle
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}/information`,
    vehicle
  );
}

export async function rebookTripVehicle(
  bookingId: string,
  tripId: number,
  vehicleId: number,
  tempBookingId: number
): Promise<void> {
  return axios.post(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}/rebook`,
    { tempBookingId }
  );
}