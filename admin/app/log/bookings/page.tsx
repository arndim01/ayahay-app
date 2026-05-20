'use client';

import { useAuthGuard } from '@/hooks/auth';
import { Table, Typography, Select, Input } from 'antd';
import React, { useCallback, useState } from 'react';
import { useServerPagination } from '@ayahay/hooks';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getBookingLogs } from '@/services/booking.service'; 

dayjs.extend(timezone);
dayjs.extend(utc);

const { Title } = Typography;

interface IBookingLog {
  id: string;
  referenceNumber: string;
  paymentStatus: string;
  totalPrice: number;
  bookingStatus: 'Pending' | 'Confirmed' | 'Cancelled' | 'Failed';
  failureCancellationRemarks?: string;
  createdAt: string;
  creatorRole: string;
}

const bookingColumns: ColumnsType<IBookingLog> = [
  {
    title: 'Reference Number',
    key: 'referenceNumber',
    dataIndex: 'referenceNumber', 
  },
  {
    title: 'Payment Status',
    key: 'paymentStatus',
    dataIndex: 'paymentStatus',
  },
  {
    title: 'Price',
    key: 'price',
    dataIndex: 'totalPrice',
    render: (price: number) => `₱${price?.toLocaleString() || 0}`,
  },
  {
    title: 'Booking Status',
    key: 'bookingStatus',
    dataIndex: 'bookingStatus',
    filters: [
      { text: 'Confirmed', value: 'Confirmed' }, 
      { text: 'Cancelled', value: 'Cancelled' },
      { text: 'Requested', value: 'Requested' }
    ],
    onFilter: (value: string | number | boolean, record: IBookingLog) =>
      record.bookingStatus === value,  
  },
  {
    title: 'Cancellation Remarks',
    key: 'cancellationRemarks',
    dataIndex: 'failureCancellationRemarks', 
  },
  {
    title: 'Created By',
    key: 'creatorRole',
    dataIndex: 'creatorRole',
  },
  {
    title: 'Created At',
    key: 'createdAt',
    dataIndex: 'createdAt',
    render: (dateIso: string) =>
      dayjs(dateIso).tz('Asia/Shanghai').format('MMM D, YYYY [at] h:mm A'),
    sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
  },
];

export default function LogsBooking() {
  useAuthGuard(['ShippingLineAdmin', 'SuperAdmin']);
  const [selectedStatus, setSelectedStatus] = useState<string>('Confirmed');
  const [bookingType, setBookingType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<IBookingLog>(
      (pagination) => getBookingLogs(pagination, undefined, selectedStatus, bookingType, searchQuery),
      true,
      [selectedStatus, bookingType, searchQuery]
    );

  const handleFilters = useCallback((filters: Record<string, any>) => {
    const status = filters.bookingStatus?.[0] || 'Confirmed';
    setSelectedStatus(status);
  }, []);

  return (
    <div style={{ margin: '32px' }}>
      <Title level={1}>Booking Logs</Title>
      <div style={{ marginBottom: 16, display: 'flex', gap: '16px' }}>
        <Input.Search
          placeholder="Search by email or reference number"
          style={{ width: 300 }}
          onSearch={(value) => {
            setSearchQuery(value);
            resetData();
          }}
          allowClear
        />
        <Select
          value={bookingType}
          style={{ width: 200 }}
          onChange={(value) => {
            setBookingType(value);
            resetData();
          }}
          options={[
            { value: 'All', label: 'All Bookings' },
            { value: 'OTC', label: 'OTC' },
            { value: 'ONLINE', label: 'Online Booking' },
          ]}
        />
      </div>
      <Table
        columns={bookingColumns}
        dataSource={dataInPage}
        loading={dataInPage === undefined}
        pagination={antdPagination}
        onChange={(pagination, filters) => {
          handleFilters(filters);
          antdOnChange(pagination);
        }}
        rowKey={(booking) => booking.referenceNumber}
        defaultFilteredValue={{
          bookingStatus: ['Confirmed']
        }}
      />
    </div>
  );
}