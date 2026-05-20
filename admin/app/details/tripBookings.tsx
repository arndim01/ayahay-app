import { IPassenger } from '@ayahay/models';
import { mockBookingPassengers, mockPassengers } from '@ayahay/mocks';
import { Table } from 'antd';
import { find } from 'lodash';
import { useEffect, useState } from 'react';

const columns = [
  {
    key: 'firstName',
    dataIndex: 'firstName',
    render: (text: string) => <span>{text}</span>,
  },
  {
    key: 'lastName',
    dataIndex: 'lastName',
    render: (text: string) => <span>{text}</span>,
  },
];

interface TripBookingsProps {
  tripId: number;
}

export default function TripBookings({ tripId }: TripBookingsProps) {
  const [passengerData, setPassengerData] = useState([] as IPassenger[]);

  useEffect(() => {
    const fetchBookings: any[] = [];
    const bookingIds = fetchBookings.map((booking) => booking.id);
    const fetchPassengerIds = bookingIds.map((id) => {
      return find(mockBookingPassengers, { bookingId: id })?.passengerId;
    });
    const fetchPassengers = fetchPassengerIds.map((id) => {
      return find(mockPassengers, { id })!;
    });

    // Note: from start of useEffect till the code before this comment, here's what I did:
    // - I get the bookings of trip
    // - get all the IDs from the bookings
    // - get all the passengerIDs given the mockBookingPassenger and bookingIds
    // - get all passenger data given the passengerIDs
    // All of these can be simplified with BE

    setPassengerData(fetchPassengers);
  }, []);

  return (
    <div>
      <Table columns={columns} dataSource={passengerData} />
    </div>
  );
}
