'use client';
import React, { useEffect, useState } from 'react';
import { IDryDock, IShip, IVoyage } from '@ayahay/models';
import { getShip } from '@ayahay/services/ship.service';
import { Typography, Table, Collapse, Button, Popconfirm } from 'antd';
import { useAuthGuard } from '@/hooks/auth';
import { PlusOutlined } from '@ant-design/icons';
import { useServerPagination } from '@ayahay/hooks';
import { PaginatedRequest } from '@ayahay/http/pagination';
import {
  createDryDock,
  createVoyage,
  getDryDocks,
  getVoyagesAfterLastMaintenance,
  getVoyagesBeforeLastMaintenance,
} from '@/services/ship.service';
import { ColumnsType } from 'antd/es/table';
import RemarksConfirmModal from '@ayahay/components/modals/RemarksConfirmModal';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

const { Title } = Typography;

const voyageColumns: ColumnsType<IVoyage> = [
  {
    title: 'Voyage Number',
    key: 'number',
    dataIndex: 'number',
  },
  {
    title: 'Voyage Date',
    key: 'dateIso',
    dataIndex: 'dateIso',
    render: (dateIso: string) =>
      dayjs(dateIso).tz('Asia/Shanghai').format('MMM D, YYYY [at] h:mm A'),
  },
  {
    title: 'Voyage Remarks',
    key: 'remarks',
    dataIndex: 'remarks',
  },
];

const dryDockColumns: ColumnsType<IDryDock> = [
  {
    title: 'Dry Dock Date',
    key: 'dateIso',
    dataIndex: 'dateIso',
    render: (dateIso: string) =>
      dayjs(dateIso).tz('Asia/Shanghai').format('MMM D, YYYY [at] h:mm A'),
  },
];

export default function ShipPage({ params }: any) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const [ship, setShip] = useState<IShip | undefined>();
  const [createVoyageModalOpen, setCreateVoyageModalOpen] = useState(false);
  const [
    hasShownVoyagesBeforeLastMaintenance,
    setHasShownVoyagesBeforeLastMaintenance,
  ] = useState(false);
  const [hasShownDryDocks, setHasShownDryDocks] = useState(false);

  const fetchShip = async () => {
    setShip(await getShip(Number(params.id)));
  };

  useEffect(() => {
    fetchShip();
  }, []);

  const fetchVoyagesAfterLastMaintenance = async (
    pagination: PaginatedRequest
  ) => {
    if (ship === undefined) {
      return undefined;
    }
    return getVoyagesAfterLastMaintenance(ship.id, pagination);
  };

  const {
    dataInPage: voyagesAfterLastMaintenance,
    antdPagination: voyagesAfterLastMaintenancePagination,
    antdOnChange: voyagesAfterLastMaintenanceChange,
    resetData: voyagesAfterLastMaintenanceReset,
  } = useServerPagination<IVoyage>(
    fetchVoyagesAfterLastMaintenance,
    ship !== undefined
  );

  const fetchVoyagesBeforeLastMaintenance = async (
    pagination: PaginatedRequest
  ) => {
    if (ship === undefined) {
      return undefined;
    }
    return getVoyagesBeforeLastMaintenance(ship.id, pagination);
  };

  const {
    dataInPage: voyagesBeforeLastMaintenance,
    antdPagination: voyagesBeforeLastMaintenancePagination,
    antdOnChange: voyagesBeforeLastMaintenanceChange,
    resetData: voyagesBeforeLastMaintenanceReset,
  } = useServerPagination<IVoyage>(
    fetchVoyagesBeforeLastMaintenance,
    ship !== undefined && hasShownVoyagesBeforeLastMaintenance
  );

  const fetchDryDocks = async (pagination: PaginatedRequest) => {
    if (ship === undefined) {
      return undefined;
    }
    return getDryDocks(ship.id, pagination);
  };

  const {
    dataInPage: dryDocks,
    antdPagination: dryDocksPagination,
    antdOnChange: dryDocksChange,
    resetData: dryDocksReset,
  } = useServerPagination<IDryDock>(
    fetchDryDocks,
    ship !== undefined && hasShownDryDocks
  );

  const onCreateVoyage = async (remarks: string) => {
    if (ship === undefined) {
      return;
    }

    await createVoyage(ship.id, remarks);
    setCreateVoyageModalOpen(false);
    voyagesAfterLastMaintenanceReset();
  };

  const onStartDryDock = async () => {
    if (ship === undefined) {
      return;
    }

    await createDryDock(ship.id);
    voyagesAfterLastMaintenanceReset();
    voyagesBeforeLastMaintenanceReset();
    dryDocksReset();
  };

  const onExpandCollapse = (expandedKeys: string | string[]) => {
    if (
      !hasShownVoyagesBeforeLastMaintenance &&
      expandedKeys.includes('voyagesBeforeLastMaintenance')
    ) {
      setHasShownVoyagesBeforeLastMaintenance(true);
    }

    if (!hasShownDryDocks && expandedKeys.includes('dryDocks')) {
      setHasShownDryDocks(true);
    }
  };

  const voyagesAfterLastMaintenanceTable = (
    <Table
      columns={voyageColumns}
      dataSource={voyagesAfterLastMaintenance}
      loading={voyagesAfterLastMaintenance === undefined}
      pagination={voyagesAfterLastMaintenancePagination}
      onChange={voyagesAfterLastMaintenanceChange}
      rowKey={(voyage) => voyage.id}
    ></Table>
  );
  const voyagesBeforeLastMaintenanceTable = (
    <Table
      columns={voyageColumns}
      dataSource={voyagesBeforeLastMaintenance}
      loading={voyagesBeforeLastMaintenance === undefined}
      pagination={voyagesBeforeLastMaintenancePagination}
      onChange={voyagesBeforeLastMaintenanceChange}
      rowKey={(voyage) => voyage.id}
    ></Table>
  );
  const dryDocksTable = (
    <Table
      columns={dryDockColumns}
      dataSource={dryDocks}
      loading={dryDocks === undefined}
      pagination={dryDocksPagination}
      onChange={dryDocksChange}
      rowKey={(dryDock) => dryDock.id}
    ></Table>
  );

  return (
    ship && (
      <div>
        <Title level={1} style={{ margin: '32px' }}>
          {ship.name}
        </Title>
        <Collapse
          defaultActiveKey='voyagesAfterLastMaintenance'
          ghost
          size='large'
          onChange={onExpandCollapse}
          items={[
            {
              key: 'voyagesAfterLastMaintenance',
              label: 'Voyages after last maintenance',
              children: voyagesAfterLastMaintenanceTable,
              extra: (
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={(event) => {
                    event.stopPropagation();
                    setCreateVoyageModalOpen(true);
                  }}
                >
                  Create Voyage
                </Button>
              ),
            },
            {
              key: 'voyagesBeforeLastMaintenance',
              label: 'Voyages before last maintenance',
              children: voyagesBeforeLastMaintenanceTable,
            },
            {
              key: 'dryDocks',
              label: 'Dry dock history',
              children: dryDocksTable,
              extra: (
                <Popconfirm
                  title='Start dry dock?'
                  description='Are you sure to start a dry dock?'
                  onConfirm={() => onStartDryDock()}
                  onPopupClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Start Dry Dock
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
        />
        <RemarksConfirmModal
          okText='Confirm'
          confirmationText='Create Voyage'
          inputPlaceholder='Reason for voyage...'
          open={createVoyageModalOpen}
          onCreateVoyage={onCreateVoyage}
          onCancel={() => setCreateVoyageModalOpen(false)}
        />
      </div>
    )
  );
}
