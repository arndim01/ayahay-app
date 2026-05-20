import { Badge, Button, Table } from 'antd';
import React, { useEffect } from 'react';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useServerPagination } from '@ayahay/hooks';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerBookingSearchResponse,
} from '@ayahay/http';
import { searchPassengerBookings } from '@/services/booking.service';
import { DISCOUNT_TYPE } from '@ayahay/constants';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

interface BookingPassengerResultsProps {
  query: string;
}

export default function BookingPassengerResults({
  query,
}: BookingPassengerResultsProps) {
  const fetchSearchResults = async (
    pagination: PaginatedRequest
  ): Promise<PaginatedResponse<PassengerBookingSearchResponse>> => {
    if (query.trim().length < 2) {
      return { data: [], total: 0 };
    }
    return searchPassengerBookings(query.trim(), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<PassengerBookingSearchResponse>(
      fetchSearchResults,
      true
    );

  useEffect(() => resetData(), [query]);

  const columns: ColumnsType<PassengerBookingSearchResponse> = [
    {
      key: 'trip',
      title: 'Trip',
      render: (_, passengerBooking) => (
        <div>
          {passengerBooking.tripSrcPortName} -&gt;&nbsp;
          {passengerBooking.tripDestPortName}
          <br />
          {dayjs(passengerBooking.tripDepartureDateIso)
            .tz('Asia/Shanghai')
            .format('MM/DD/YYYY hh:mm')}
        </div>
      ),
    },
    {
      key: 'passengerName',
      title: 'Passenger',
      render: (_, passengerBooking) => (
        <>
          {passengerBooking.firstName} {passengerBooking.lastName}
          <br />
          {DISCOUNT_TYPE[passengerBooking.discountType] ?? 'Adult'}
        </>
      ),
    },
    {
      key: 'referenceNo',
      dataIndex: 'referenceNo',
      title: 'Reference Number',
    },
    {
      key: 'status',
      title: 'Booking Status',
      render: (_, passengerBooking) => {
        if (passengerBooking.bookingStatus === 'Cancelled') {
          return <Badge status='error' text='Cancelled' />;
        }
        if (passengerBooking.checkInDateIso === undefined) {
          return (
            <>
              <Badge status='success' text='Confirmed' /> <br />
              <Badge status='default' text='Not checked in' />
            </>
          );
        }
        const checkInDateFromNow = dayjs(
          passengerBooking.checkInDateIso
        ).fromNow();

        return (
          <>
            <Badge status='success' text='Confirmed' /> <br />
            <Badge status='success' text={`Checked in ${checkInDateFromNow}`} />
          </>
        );
      },
    },
    {
      title: 'Actions',
      render: (_, passengerBooking) => {
        return (
          <Button
            type='primary'
            href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/bookings/${passengerBooking.bookingId}`}
            target='_blank'
          >
            View Booking
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataInPage}
        loading={dataInPage === undefined}
        pagination={antdPagination}
        onChange={antdOnChange}
      ></Table>
    </div>
  );
}
