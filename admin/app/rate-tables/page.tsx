'use client';

import { IRateTable } from '@ayahay/models';
import { getRateTables } from '@ayahay/services/rate-table.service';
import { Button, Typography } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/auth';

const { Title } = Typography;

const columns: ColumnsType<IRateTable> = [
  {
    title: 'Rate Table Name',
    key: 'name',
    dataIndex: 'name',
  },
  {
    title: 'Actions',
    render: (_, rateTable: IRateTable) => (
      <div>
        <Button
          type='primary'
          href={`/rate-tables/${rateTable.id}`}
          target='_blank'
        >
          Edit
        </Button>
      </div>
    ),
  },
];

export default function RateTablesPage() {
  useAuthGuard(['ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin']);

  const [rateTables, setRateTables] = useState<IRateTable[] | undefined>();

  const fetchRateTables = async () => {
    setRateTables(await getRateTables());
  };

  useEffect(() => {
    fetchRateTables();
  }, []);

  return (
    <div style={{ margin: '32px' }}>
      <Title level={1}>Rate Tables</Title>
      <Table columns={columns} dataSource={rateTables} tableLayout='fixed' />
    </div>
  );
}
