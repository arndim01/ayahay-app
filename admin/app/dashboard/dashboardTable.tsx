import BarChart from '@/components/charts/BarChart';
import { buildPaxAndVehicleBookedData } from '@/services/dashboard.service';
import { getDashboardTrips } from '@/services/search.service';
import {
  ArrowRightOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CarOutlined,
} from '@ant-design/icons';
import {
  DashboardTrips,
  PaginatedRequest,
  PortsAndDateRangeSearch,
} from '@ayahay/http';
import { Button, Popover, Skeleton, Table, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import styles from './page.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import { NotCheckedInModal } from '@/components/modal/NotCheckedInModal';
import { useServerPagination } from '@ayahay/hooks';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/navigation';

dayjs.extend(timezone);
dayjs.extend(utc);

interface DashboardTableProps {
  searchQuery: PortsAndDateRangeSearch | undefined;
}

export default function DashboardTable({ searchQuery }: DashboardTableProps) {
  const router = useRouter();
  const { loggedInAccount } = useAuth();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleButtonClick = async (record: DashboardTrips, type: 'passenger' | 'vehicle') => {
    const buttonKey = `${record.id}-${type}`;
    try {
      setLoadingStates(prev => ({ ...prev, [buttonKey]: true }));
      await navigateToBookings(record, type);
    } catch (error) {
      setLoadingStates(prev => ({ ...prev, [buttonKey]: false }));
      console.error('Navigation error:', error);
    }
  };

  const columns: ColumnsType<DashboardTrips> = [
    {
      title: 'Route',
      key: 'srcDestPort',
      render: (_: string, record: DashboardTrips) => (
        <div className={styles.routeContainer}>
          <span className={styles.portName}>{record.srcPort!.name}</span>
          <ArrowRightOutlined className={styles.arrow} />
          <span className={styles.portName}>{record.destPort!.name}</span>
        </div>
      ),
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Departure Date',
      key: 'departureDateIso',
      dataIndex: 'departureDateIso',
      render: (departureDateIso: string) => (
        <span>
          {dayjs(departureDateIso)
            .tz('Asia/Shanghai')
            .format('MM/DD/YYYY h:mm A')}
        </span>
      ),
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Pax Onboarded',
      key: 'paxOnboardedOverBooked',
      render: (_: string, record: DashboardTrips) => {
        const passengerNames = record.notCheckedInPassengerNames.map((name) => ({
          data: name,
        }));

        return (
          <div>
            <span>{record.checkedInPassengerCount ?? 0}</span>/
            <span>{record.passengerCapacities - record.availableCapacities}</span>
            &nbsp;
            <Popover
              content={<NotCheckedInModal data={passengerNames} />}
              trigger='click'
            >
              <Button type='text' style={{ padding: 0 }}>
                <InfoCircleOutlined rev={undefined} />
              </Button>
            </Popover>
          </div>
        );
      },
      align: 'center',
    },
    {
      title: 'Vehicle Onboarded',
      key: 'vehicleOnboardedOverBooked',
      render: (_: string, record: DashboardTrips) => {
        const plateNumbersAndModelName = record.notCheckedInVehicles.map(
          (plateNoAndModelName) => ({
            data: plateNoAndModelName,
          })
        );

        return (
          <div>
            <span>{record.checkedInVehicleCount ?? 0}</span>/
            <span>
              {record.vehicleCapacity - record.availableVehicleCapacity}
            </span>
            &nbsp;
            <Popover
              content={<NotCheckedInModal data={plateNumbersAndModelName} />}
              trigger='click'
            >
              <Button type='text' style={{ padding: 0 }}>
                <InfoCircleOutlined />
              </Button>
            </Popover>
          </div>
        );
      },
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: string, record: DashboardTrips) => {
        const passengerKey = `${record.id}-passenger`;
        const vehicleKey = `${record.id}-vehicle`;
        const isLoading = loadingStates[passengerKey] || loadingStates[vehicleKey];
        
        return (
          <Space size={[8, 16]} wrap className={styles.actionButtons}>
            <Button
              type="primary"
              size="middle"
              icon={<UserOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick(record, 'passenger');
              }}
              loading={loadingStates[passengerKey]}
              disabled={isLoading}
            >
              Passenger Bookings
            </Button>
            <Button
              size="middle"
              icon={<CarOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick(record, 'vehicle');
              }}
              loading={loadingStates[vehicleKey]}
              disabled={isLoading}
            >
              Vehicle Bookings
            </Button>
          </Space>
        );
      },
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Trip Details',
      key: 'mobileDetails',
      render: (_: string, record: DashboardTrips) => {
        const passengerKey = `${record.id}-passenger`;
        const vehicleKey = `${record.id}-vehicle`;
        const isLoading = loadingStates[passengerKey] || loadingStates[vehicleKey];

        return (
          <div className={styles.mobileDetails}>
            <div className={styles.mobileRoute}>
              <div className={styles.mobileLabel}>Route:</div>
              <div>{record.srcPort!.name} → {record.destPort!.name}</div>
            </div>
            <div className={styles.mobileDeparture}>
              <div className={styles.mobileLabel}>Departure:</div>
              <div>{dayjs(record.departureDateIso).format('MMM DD, YYYY h:mm A')}</div>
            </div>
            <div className={styles.mobileActions}>
              <Button 
                type="primary" 
                block 
                icon={<UserOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick(record, 'passenger');
                }}
                loading={loadingStates[passengerKey]}
                disabled={isLoading}
              >
                Passenger Bookings
              </Button>
              <Button 
                block 
                icon={<CarOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick(record, 'vehicle');
                }}
                loading={loadingStates[vehicleKey]}
                disabled={isLoading}
              >
                Vehicle Bookings
              </Button>
            </div>
          </div>
        );
      },
      responsive: ['xs'],
    }
  ];

  useEffect(() => resetData(), [searchQuery]);

  const fetchTripInformation = async (pagination: PaginatedRequest) => {
    return getDashboardTrips(
      loggedInAccount?.shippingLineId,
      searchQuery,
      pagination
    );
  };

  const {
    dataInPage: tripInfo,
    antdPagination,
    antdOnChange,
    resetData,
  } = useServerPagination<DashboardTrips>(
    fetchTripInformation,
    loggedInAccount !== null && loggedInAccount !== undefined
  );

  const paxAndVehicleBookedData = buildPaxAndVehicleBookedData(tripInfo!);

  // Add helper function for navigation
  const navigateToBookings = (record: DashboardTrips, type: 'passenger' | 'vehicle') => {
    const baseQueryParams = {
      tripId: record.id.toString(),
      shipName: record.ship?.name || '',
      route: `${record.srcPort?.name} → ${record.destPort?.name}`,
      departureDate: record.departureDateIso,
      vehicleCapacity: record.vehicleCapacity.toString()
    };

    const path = type === 'passenger' ? '/passenger-bookings' : '/vehicle-bookings';
    const queryString = new URLSearchParams(baseQueryParams).toString();
    router.push(`${path}?${queryString}`);
  };

  return (
    <>
      <Table
        dataSource={tripInfo}
        columns={columns}
        pagination={antdPagination}
        onChange={antdOnChange}
        loading={tripInfo === undefined}
        tableLayout='fixed'
        rowKey={(trip) => trip.id}
        className={styles.dashboardTable}
      />
      <div className={styles['bar-graph']}>
        {!tripInfo && (
          <Skeleton.Node active>
            <BarChartOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
          </Skeleton.Node>
        )}
        {paxAndVehicleBookedData && <BarChart data={paxAndVehicleBookedData} />}
      </div>
    </>
  );
}
