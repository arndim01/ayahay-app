'use client';

import { IRateTable, IRateTableMarkup, IRateTableRow } from '@ayahay/models';
import {
  getFullRateTableById,
  createRateMarkup as _createRateMarkup,
  updateRateMarkup as _updateRateMarkup,
} from '@ayahay/services/rate-table.service';
import { App, Button, Typography } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import UpsertRateMarkupModal from '@/components/modal/UpsertRateMarkupModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/auth';

const { Title } = Typography;

const vehicleRatesColumns: ColumnsType<IRateTableRow> = [
  {
    title: 'Vehicle Type',
    key: 'vehicleType',
    render: (_, rateTableRow: IRateTableRow) => rateTableRow.vehicleType?.name,
  },
  {
    title: 'Fare',
    key: 'fare',
    dataIndex: 'fare',
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

const cabinRatesColumns: ColumnsType<IRateTableRow> = [
  {
    title: 'Cabin',
    key: 'cabin',
    render: (_, rateTableRow: IRateTableRow) => rateTableRow.cabin?.name,
  },
  {
    title: 'Fare',
    key: 'fare',
    dataIndex: 'fare',
  },
];

export default function RateTablePage({ params }: any) {
  useAuthGuard(['ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin']);

  const { notification } = App.useApp();
  const [rateTable, setRateTable] = useState<IRateTable | undefined>();
  const [upsertRateMarkupModalOpen, setUpsertRateMarkupModalOpen] =
    useState(false);
  const [markupToUpsert, setMarkupToUpsert] = useState<IRateTableMarkup>(
    {} as any
  );

  const { loggedInAccount } = useAuth();

  const rateTableMarkupColumns: ColumnsType<IRateTableMarkup> = [
    {
      title: 'Travel Agency',
      key: 'travelAgency',
      render: (_, rateTableMarkup: IRateTableMarkup) =>
        rateTableMarkup.travelAgency?.name,
    },

    {
      title: 'Flat Markup',
      key: 'markupFlat',
      dataIndex: 'markupFlat',
    },

    {
      title: 'Percent Markup',
      key: 'markupPercent',
      dataIndex: 'markupPercent',
      render: (markupPercent) => `${markupPercent * 100}%`,
    },
    {
      title: 'Max Flat Markup',
      key: 'markupMaxFlat',
      dataIndex: 'markupMaxFlat',
    },
    {
      title: 'Commission Flat',
      key: 'commission_flat',
      dataIndex: 'commission_flat',
    },
    {
      title: 'Commission Percent',
      key: 'commission_percent',
      dataIndex: 'commission_percent',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, rateTableMarkup) => (
        <Button
          onClick={() => {
            setMarkupToUpsert(rateTableMarkup);
            setUpsertRateMarkupModalOpen(true);
          }}
          icon={<EditOutlined />}
        >
          Edit
        </Button>
      ),
    },
  ];

  const fetchRateTable = async () => {
    setRateTable(await getFullRateTableById(params.id));
  };

  useEffect(() => {
    fetchRateTable();
  }, []);

  useEffect(() => {
    if (!rateTable || loggedInAccount?.role !== 'TravelAgencyAdmin') {
      return;
    }

    if (rateTable.markups.length === 0) {
      // initialize markup for rate table's shipping line for creation
      const defaultMarkup = {
        id: 0,
        rateTableId: rateTable.id,
        travelAgency: loggedInAccount.travelAgency,
        travelAgencyId: loggedInAccount.travelAgencyId,
        markupFlat: 0,
        markupPercent: 0,
        markupMaxFlat: 0,
      };
      setRateTable({
        ...rateTable,
        markups: [defaultMarkup],
      });
    }
  }, [rateTable, loggedInAccount]);

  const createRateMarkup = async (rateMarkup: IRateTableMarkup) => {
    if (rateTable === undefined) {
      return;
    }
    try {
      await _createRateMarkup(rateTable.id, rateMarkup);
      setUpsertRateMarkupModalOpen(false);
      fetchRateTable();
      notification.success({
        message: 'Saved Changes',
        description: 'Your changes have been saved successfully.',
      });
    } catch (e) {
      notification.error({
        message: 'Changes not saved',
        description: 'Something went wrong.',
      });
    }
  };

  const updateRateMarkup = async (rateMarkup: IRateTableMarkup) => {
    if (rateTable === undefined) {
      return;
    }
    try {
      await _updateRateMarkup(rateTable.id, rateMarkup);
      setUpsertRateMarkupModalOpen(false);
      fetchRateTable();
      notification.success({
        message: 'Saved Changes',
        description: 'Your changes have been saved successfully.',
      });
    } catch (e) {
      notification.error({
        message: 'Changes not saved',
        description: 'Something went wrong.',
      });
    }
  };

  return (
    <div style={{ margin: '32px' }}>
      {rateTable && loggedInAccount && (
        <>
          <Title level={1}>{rateTable.name} </Title>
          <Title level={2}>Markups</Title>
          <Table
            columns={rateTableMarkupColumns}
            rowKey={(markup) => markup.id}
            dataSource={rateTable.markups}
            tableLayout='fixed'
          />
          <Title level={2}>Cabin Rates</Title>
          <Table
            columns={cabinRatesColumns}
            rowKey={(rate) => rate.id}
            dataSource={rateTable.rows.filter((rate) => rate.cabinId)}
            tableLayout='fixed'
          />
          <Title level={2}>Vehicle Rates</Title>
          <Table
            columns={vehicleRatesColumns}
            rowKey={(rate) => rate.id}
            dataSource={rateTable.rows.filter((rate) => rate.vehicleTypeId)}
            tableLayout='fixed'
          />
          <UpsertRateMarkupModal
            open={upsertRateMarkupModalOpen}
            originalMarkup={markupToUpsert}
            loggedInAccount={loggedInAccount}
            onCreateRateMarkup={createRateMarkup}
            onUpdateRateMarkup={updateRateMarkup}
            onCancel={() => setUpsertRateMarkupModalOpen(false)}
            width={300}
          />
        </>
      )}
    </div>
  );
}
