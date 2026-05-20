import React, { useEffect, useState } from 'react';
import { Pagination, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ceil } from 'lodash';

const { Title } = Typography;

interface PassengerRate {
  key?: number;
  cabinTypeName?: string;
  cabinTypeFare: number;
}

interface VehicleRate {
  key?: number;
  vehicleTypeName?: string;
  vehicleTypeFare: number;
}

interface VehicleRatesData {
  vehicleTypeRates: VehicleRate[];
  page: number;
}

interface TripRatesModalProps {
  passengerRates: PassengerRate[];
  vehicleRates: VehicleRate[];
}

const passengerRateColumns: ColumnsType<PassengerRate> = [
  {
    title: 'Cabin',
    dataIndex: 'cabinTypeName',
    key: 'cabinTypeName',
  },
  {
    title: 'Fare',
    dataIndex: 'cabinTypeFare',
    key: 'cabinTypeFare',
  },
];

const vehicleRateColumns: ColumnsType<VehicleRate> = [
  {
    title: 'Vehicle Type',
    dataIndex: 'vehicleTypeName',
    key: 'vehicleTypeName',
  },
  {
    title: 'Fare',
    dataIndex: 'vehicleTypeFare',
    key: 'vehicleTypeFare',
  },
];
const PAGE_SIZE = 5;

export function TripRatesModal({
  passengerRates,
  vehicleRates,
}: TripRatesModalProps) {
  const [vehicleData, setVehicleData] = useState([] as VehicleRatesData[]);
  const [page, setPage] = useState(1);
  const totalItems = vehicleRates.length;
  const data: VehicleRatesData[] = [];
  let vehicleTypeRates: VehicleRate[] = [];

  useEffect(() => {
    vehicleRates.forEach((rate, idx) => {
      const incrementOfFive = (Number(idx) + 1) % PAGE_SIZE === 0;
      const lastElement = idx + 1 === totalItems;

      vehicleTypeRates.push({
        ...rate,
      });

      if (incrementOfFive || lastElement) {
        data.push({
          vehicleTypeRates,
          page: ceil((Number(idx) + 1) / PAGE_SIZE),
        });
        setVehicleData(data);
        vehicleTypeRates = [];
      }
    });
  }, []);

  return (
    <article
      style={{ minWidth: '260px', maxHeight: '360px', overflowY: 'auto' }}
    >
      <Title level={3}>Passengers</Title>
      <Table
        columns={passengerRateColumns}
        dataSource={passengerRates}
        pagination={false}
      />
      &nbsp;
      <Title level={3}>Vehicles</Title>
      <Table
        columns={vehicleRateColumns}
        dataSource={vehicleData[page - 1]?.vehicleTypeRates}
        pagination={false}
      />
      {totalItems / PAGE_SIZE > 1 && (
        <Pagination
          total={totalItems}
          current={page}
          pageSize={PAGE_SIZE}
          onChange={(page) => setPage(page)}
        ></Pagination>
      )}
    </article>
  );
}
