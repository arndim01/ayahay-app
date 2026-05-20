import React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useClientPagination } from '@ayahay/hooks';

interface BookedVehicle {
  key?: number;
  vehicleDescription: string;
  vehiclePrice: number;
  checkedIn: string;
}

interface BookedVehiclesModalProps {
  vehicles: BookedVehicle[];
}

const bookedVehicleColumns: ColumnsType<BookedVehicle> = [
  {
    title: 'Vehicle Type',
    dataIndex: 'vehicleDescription',
    key: 'vehicleDescription',
  },
  {
    title: 'Vehicle Price',
    dataIndex: 'vehiclePrice',
    key: 'vehiclePrice',
  },
  {
    title: 'Checked-in',
    dataIndex: 'checkedIn',
    key: 'checkedIn',
  },
];

export function BookedVehiclesModal({ vehicles }: BookedVehiclesModalProps) {
  const { dataInPage, antdPagination, antdOnChange } =
    useClientPagination<BookedVehicle>(vehicles);

  return (
    <article
      style={{ minWidth: '260px', maxHeight: '360px', overflowY: 'auto' }}
    >
      <Table
        columns={bookedVehicleColumns}
        dataSource={dataInPage}
        pagination={antdPagination}
        onChange={antdOnChange}
        size='small'
      />
    </article>
  );
}
