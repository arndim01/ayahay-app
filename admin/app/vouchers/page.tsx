'use client';

import { useAuthGuard } from '@/hooks/auth';
import { Button, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { IVoucher } from '@ayahay/models';
import { useServerPagination } from '@ayahay/hooks';
import {
  createVoucher as _createVoucher,
  getVouchers,
} from '@/services/voucher.service';
import { ColumnsType } from 'antd/es/table';
import CreateVoucherModal from '@/components/modal/CreateVoucherModal';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

const { Title } = Typography;

const voucherColumns: ColumnsType<IVoucher> = [
  {
    title: 'Code',
    key: 'code',
    dataIndex: 'code',
  },
  {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
  },
  {
    title: 'Flat Discount',
    key: 'discountFlat',
    dataIndex: 'discountFlat',
  },
  {
    title: 'Percentage Discount',
    key: 'discountPercent',
    dataIndex: 'discountPercent',
    render: (discountPercent: number) => discountPercent * 100,
  },
  {
    title: 'Expiry Date',
    key: 'expiryIso',
    dataIndex: 'expiryIso',
    render: (dateIso: string) =>
      dayjs(dateIso).tz('Asia/Shanghai').format('MMM D, YYYY [at] h:mm A'),
  },
  {
    title: 'Remaining Uses',
    key: 'remainingUses',
    dataIndex: 'remainingUses',
  },
  {
    title: 'Online Booking',
    key: 'canBookOnline',
    dataIndex: 'canBookOnline',
    render: (canBookOnline: boolean) => {
      if (canBookOnline) {
        return '✔️';
      } else {
        return '❌';
      }
    },
  },
];

export default function VouchersPage() {
  useAuthGuard(['ShippingLineAdmin', 'SuperAdmin']);

  const [createVoucherModalOpen, setCreateVoucherModalOpen] = useState(false);

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<IVoucher>(getVouchers, true);

  const createVoucher = async (voucher: IVoucher): Promise<void> => {
    await _createVoucher(voucher);
    setCreateVoucherModalOpen(false);
    resetData();
  };

  return (
    <div style={{ margin: '32px' }}>
      <Title level={1}>Vouchers</Title>
      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={() => setCreateVoucherModalOpen(true)}
      >
        Create Voucher
      </Button>
      <Table
        columns={voucherColumns}
        dataSource={dataInPage}
        loading={dataInPage === undefined}
        pagination={antdPagination}
        onChange={antdOnChange}
        rowKey={(voucher) => voucher.code}
      ></Table>
      <CreateVoucherModal
        open={createVoucherModalOpen}
        onCreateVoucher={createVoucher}
        onCancel={() => setCreateVoucherModalOpen(false)}
        width={300}
      />
    </div>
  );
}
