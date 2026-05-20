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
  VehicleBookingSearchResponse,
} from '@ayahay/http';
import { searchVehicleBookings } from '@/services/booking.service';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

interface BookingVehicleResultsProps {
  query: string;
}

export default function BookingVehicleResults({
  query,
}: BookingVehicleResultsProps) {
  const fetchSearchResults = async (
    pagination: PaginatedRequest
  ): Promise<PaginatedResponse<VehicleBookingSearchResponse>> => {
    if (query.trim().length < 2) {
      return { data: [], total: 0 };
    }
    return searchVehicleBookings(query.trim(), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<VehicleBookingSearchResponse>(fetchSearchResults, true);

  useEffect(() => resetData(), [query]);

  const columns: ColumnsType<VehicleBookingSearchResponse> = [
    {
      key: 'trip',
      title: 'Trip',
      render: (_, vehicleBooking) => (
        <div>
          {vehicleBooking.tripSrcPortName} -&gt;&nbsp;
          {vehicleBooking.tripDestPortName}
          <br />
          {dayjs(vehicleBooking.tripDepartureDateIso)
            .tz('Asia/Shanghai')
            .format('MM/DD/YYYY hh:mm')}
        </div>
      ),
    },
    {
      key: 'vehicleName',
      title: 'Vehicle',
      render: (_, vehicleBooking) => (
        <div>
          {vehicleBooking.plateNo}
          <br />
          {vehicleBooking.modelName} {vehicleBooking.modelYear}
        </div>
      ),
    },
    {
      key: 'referenceNo',
      dataIndex: 'referenceNo',
      title: 'Reference Number',
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, vehicleBooking) => {
        if (vehicleBooking.bookingStatus === 'Cancelled') {
          return <Badge status='error' text='Cancelled' />;
        }
        if (vehicleBooking.checkInDateIso === undefined) {
          return (
            <>
              <Badge status='success' text='Confirmed' /> <br />
              <Badge status='default' text='Not checked in' />
            </>
          );
        }
        const checkInDateFromNow = dayjs(
          vehicleBooking.checkInDateIso
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
      render: (_, vehicleBooking) => {
        return (
          <Button
            type='primary'
            href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/bookings/${vehicleBooking.bookingId}`}
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
