'use client';
import styles from './page.module.scss';
import {
  getMyBookings,
  getSavedBookingsInBrowser,
} from '@/services/booking.service';
import { IBooking } from '@ayahay/models';
import { Button, Typography } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServerPagination } from '@ayahay/hooks';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

const { Title } = Typography;

const bookingColumns: ColumnsType<IBooking> = [
  {
    title: 'Reference No',
    dataIndex: 'referenceNo',
    key: 'referenceNo',
  },
  {
    title: 'Route',
    render: (_, booking) =>
      `${booking.bookingTrips?.[0]?.trip?.srcPort?.name} -> ${booking.bookingTrips?.[0]?.trip?.destPort?.name}`,
  },
  {
    title: 'Status',
    dataIndex: 'bookingStatus',
    key: 'bookingStatus',
    responsive: ['md'],
  },
  {
    title: 'Created At',
    dataIndex: 'createdAtIso',
    key: 'createdAtIso',
    render: (createdAtIso: string) =>
      dayjs(createdAtIso).tz('Asia/Shanghai').format('MM/DD/YY [at] h:mm A'),
    responsive: ['lg'],
  },
  {
    title: 'Total Price',
    dataIndex: 'totalPrice',
    key: 'totalPrice',
    responsive: ['lg'],
  },
  {
    title: '# Passengers',
    render: (_, booking) => {
      return booking.bookingTrips?.[0]?.bookingTripPassengers?.length;
    },
    responsive: ['lg'],
  },
  {
    title: 'Actions',
    render: (_, booking) => {
      return (
        <Button type='primary' href={`/bookings/${booking.id}`} target='_blank'>
          View Ticket
        </Button>
      );
    },
  },
];

export default function MyBookings() {
  const { loggedInAccount } = useAuth();
  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<IBooking>(getMyBookings, true);
  const [savedBookings, setSavedBookings] = useState<IBooking[] | undefined>();

  const loadSavedBookings = async () => {
    const savedBookingsInBrowser = await getSavedBookingsInBrowser();
    setSavedBookings(savedBookingsInBrowser);
  };

  useEffect(() => {
    loadSavedBookings();
  }, []);

  useEffect(() => {
    resetData();
  }, [loggedInAccount]);

  return (
    <div className={styles['main-container']}>
      <section>
        <Title level={1}>My Bookings</Title>
        <Table
          dataSource={dataInPage}
          columns={bookingColumns}
          pagination={antdPagination}
          onChange={antdOnChange}
          loading={dataInPage === undefined}
          tableLayout='fixed'
          rowKey={(booking) => booking.id}
        />
      </section>
      <section>
        <Title level={2}>Saved in Browser</Title>
        <p>
          Warning: These bookings will disappear if the browser data is cleared.
        </p>
        <Table
          dataSource={savedBookings}
          columns={bookingColumns}
          pagination={false}
          loading={savedBookings === undefined}
          tableLayout='fixed'
          rowKey={(booking) => booking.id}
        />
      </section>
    </div>
  );
}
