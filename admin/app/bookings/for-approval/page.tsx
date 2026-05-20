'use client';

import { useAuthGuard } from '@/hooks/auth';
import { useServerPagination } from '@ayahay/hooks';
import { IBooking } from '@ayahay/models';
import {
  approveBookingRequest,
  getBookingRequests,
} from '@/services/booking.service';
import Table, { ColumnsType } from 'antd/es/table';
import { Button, notification, Typography } from 'antd';
import dayjs from 'dayjs';
import { PaginatedResponse, PaginatedRequest } from '@ayahay/http';
import { getTrips } from '@ayahay/services/trip.service';

const { Title } = Typography;

export default function BookingRequestsPage() {
  useAuthGuard(['ShippingLineAdmin', 'SuperAdmin']);
  const [api, contextHolder] = notification.useNotification();

  const fetchBookingRequests = async (
    pagination: PaginatedRequest
  ): Promise<PaginatedResponse<IBooking>> => {
    const paginatedBookingRequests = await getBookingRequests(pagination);

    // fetch trips associated to each bookingVehicle
    const tripIds: any = paginatedBookingRequests.data.map(
      (booking) => booking.bookingTrips?.[0]?.tripId
    );
    const trips = await getTrips(tripIds);

    for (let i = 0; i < paginatedBookingRequests.data.length; i++) {
      const booking = paginatedBookingRequests.data[i];
      if (!booking.bookingTrips || trips === undefined) {
        continue;
      }
      booking.bookingTrips[0].trip = trips[i];
    }

    return paginatedBookingRequests;
  };

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<IBooking>(fetchBookingRequests, true);

  const onClickApprove = async (bookingId: string): Promise<void> => {
    try {
      await approveBookingRequest(+bookingId);
      resetData();
      api.success({
        message: 'Booking Approved',
        description: 'The booking has been approved.',
      });
    } catch {
      api.error({
        message: 'Booking Approval Failed',
        description: 'The booking approval has failed.',
      });
    }
  };

  const bookingRequestColumns: ColumnsType<IBooking> = [
    {
      title: 'Trip',
      render: (_, booking) => {
        const trip = booking.bookingTrips?.[0]?.trip;
        if (trip === undefined) {
          return '';
        }
        return (
          <>
            <div>
              {trip.srcPort?.name} -&gt; {trip.destPort?.name}
            </div>
            <div>
              {dayjs(trip.departureDateIso).format('MMM D, YYYY [at] h:mm A')}
            </div>
          </>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAtIso',
      key: 'createdAtIso',
      render: (createdAtIso: string) => new Date(createdAtIso).toLocaleString(),
      responsive: ['lg'],
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      responsive: ['lg'],
    },
    {
      title: 'Vehicles',
      render: (_, booking) => {
        if (
          booking.bookingTrips === undefined ||
          booking.bookingTrips[0].bookingTripVehicles === undefined
        ) {
          return '';
        }

        return booking.bookingTrips[0].bookingTripVehicles
          .map(
            (bookingTripVehicle) => bookingTripVehicle.vehicle.vehicleType?.name
          )
          .join(', ');
      },
      responsive: ['lg'],
    },
    {
      title: 'Actions',
      render: (_, booking) => {
        return (
          <>
            <Button type='primary' onClick={() => onClickApprove(booking.id)}>
              Approve
            </Button>
            <Button
              type='default'
              href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/bookings/requests/${booking.id}`}
              target='_blank'
            >
              View
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div style={{ margin: '32px' }}>
      <section>
        <Title level={1}>Bookings For Approval</Title>
        <Table
          dataSource={dataInPage}
          columns={bookingRequestColumns}
          pagination={antdPagination}
          onChange={antdOnChange}
          loading={dataInPage === undefined}
          tableLayout='fixed'
          rowKey={(booking) => booking.id}
        />
      </section>
      {contextHolder}
    </div>
  );
}
