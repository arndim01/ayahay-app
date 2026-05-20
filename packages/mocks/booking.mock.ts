import { mockBookingPassengers } from './booking-passenger.mock';
import { IBooking } from '@ayahay/models';

export const mockBooking: IBooking = {
  id: '1',
  accountId: '',
  totalPrice: 1000,
  bookingType: 'Single',
  createdAtIso: '',
  referenceNo: '',
  status: 'Pending',
  bookingPassengers: [
    mockBookingPassengers[0],
    mockBookingPassengers[1],
    mockBookingPassengers[2],
    mockBookingPassengers[3],
    mockBookingPassengers[4],
    mockBookingPassengers[5],
  ],
};

export const mockBookings: IBooking[] = [
  mockBooking,
  {
    id: '2',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    referenceNo: '',
    status: 'Pending',
  },
  {
    id: '3',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    referenceNo: '',
    status: 'Pending',
  },
  {
    id: '4',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    referenceNo: '',
    status: 'Pending',
    bookingPassengers: [mockBookingPassengers[6]],
  },
  {
    id: '5',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    referenceNo: '',
    status: 'Pending',
    bookingPassengers: [
      mockBookingPassengers[7],
      mockBookingPassengers[8],
      mockBookingPassengers[9],
    ],
  },
  {
    id: '6',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    referenceNo: '',
    status: 'Pending',
  },
];
