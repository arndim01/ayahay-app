'use client';
import React, { useEffect, useState } from 'react';
import { Button, Skeleton, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useAuthGuard } from '@/hooks/auth';
import styles from './page.module.scss';
import { getPortsByShip } from '@/services/reporting.service';
import { PortsByShip, TripSearchByDateRange } from '@ayahay/http';
import { isEmpty } from 'lodash';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { IShippingLine } from '@ayahay/models';

const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;

const columns: ColumnsType<PortsByShip> = [
  {
    key: 'logo',
    dataIndex: 'shippingLine',
    render: (shippingLine: IShippingLine) => (
      <img
        src={`${SHIPPING_LINE_LOGO}${shippingLine?.logoFilename}`}
        alt='Logo'
        height={80}
      />
    ),
    align: 'center',
  },
  {
    title: 'Route',
    key: 'srcDestPort',
    render: (_, record: PortsByShip) => (
      <span className={styles['port']}>
        {record.srcPort!.name} <ArrowRightOutlined />
        &nbsp;
        {record.destPort!.name}
      </span>
    ),
    align: 'center',
  },
  {
    title: 'Vessel',
    key: 'logo',
    render: (_, record: PortsByShip) => <span>{record.ship?.name}</span>,
    align: 'center',
  },
  {
    title: 'Per Trip Reporting',
    render: (_, record: PortsByShip) => {
      return (
        <Button
          type='primary'
          href={`/reporting/summary/ship?shipId=${record.shipId}&shippingLineId=${record.shippingLine.id}&srcPortId=${record.srcPortId}&destPortId=${record.destPortId}&startDate=${record.startDate}&endDate=${record.endDate}`}
          target='_blank'
        >
          Generate
        </Button>
      );
    },
    align: 'center',
  },
  {
    title: 'Per Vessel Reporting',
    render: (_, record: PortsByShip) => {
      return (
        <Button
          type='primary'
          href={`/reporting/summary/ship?shipId=${record.shipId}&shippingLineId=${record.shippingLine.id}&startDate=${record.startDate}&endDate=${record.endDate}&reportType=all`}
          target='_blank'
        >
          Generate
        </Button>
      );
    },
    align: 'center',
  },
];

interface ShipListProps {
  searchQuery: TripSearchByDateRange | undefined;
}

export default function ShipList({ searchQuery }: ShipListProps) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [shipsData, setShipsData] = useState([] as PortsByShip[] | undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShips();
  }, [loggedInAccount, searchQuery]);

  const fetchShips = async () => {
    if (isEmpty(searchQuery)) {
      return;
    }
    setLoading(true);
    const ships = await getPortsByShip(
      searchQuery.startDate,
      searchQuery.endDate
    );
    setShipsData(
      ships?.map((ship) => {
        return {
          ...ship,
          startDate: searchQuery.startDate,
          endDate: searchQuery.endDate,
        };
      })
    );
    setLoading(false);
  };

  return (
    <div>
      <Skeleton
        loading={loading}
        active
        title={false}
        paragraph={{
          rows: 5,
          width: ['98%', '98%', '98%', '98%', '98%'],
        }}
      >
        {shipsData && (
          <Table
            columns={columns}
            dataSource={shipsData}
            pagination={false}
          ></Table>
        )}
      </Skeleton>
    </div>
  );
}
