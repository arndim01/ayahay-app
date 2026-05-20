'use client';
import { useAuthGuard } from '@/hooks/auth';
import {
  getVehicleBookingsOfTrip,
  getTripDetails,
} from '@/services/trip.service';
import styles from './page.module.scss';
import { ColumnsType } from 'antd/es/table';
import { CarOutlined } from '@ant-design/icons';
import { Button, Divider, Popover, Spin, Table, Typography } from 'antd';
import { PaginatedRequest, VehicleBookings } from '@ayahay/http';
import { BookedVehiclesModal } from '@/components/modal/BookedVehiclesModal';
import { useServerPagination } from '@ayahay/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { ITrip } from '@ayahay/models';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getAxiosError } from '@ayahay/services/error.service';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

const { Title } = Typography;

const bookingColumns: ColumnsType<VehicleBookings> = [
  {
    title: 'Reference No',
    key: 'referenceNo',
    dataIndex: 'referenceNo',
    align: 'center',
  },
  {
    title: 'Booking Price',
    key: 'bookingPrice',
    dataIndex: 'totalPrice',
    align: 'center',
  },
  {
    title: 'Vehicles',
    key: 'vehicles',
    render: (_: string, record: VehicleBookings) => {
      const vehicles = record.bookingTripVehicles!.map(
        (bookingTripVehicle) => ({
          vehicleDescription:
            bookingTripVehicle.vehicle!.vehicleType!.description,
          vehiclePrice: bookingTripVehicle.totalPrice!,
          checkedIn: bookingTripVehicle.hasOwnProperty('checkInDate')
            ? 'Yes'
            : 'No',
        })
      );

      return (
        <div>
          <Popover
            content={<BookedVehiclesModal vehicles={vehicles} />}
            trigger='click'
          >
            <Button type='text'>
              <CarOutlined />
            </Button>
          </Popover>
        </div>
      );
    },
    align: 'center',
  },
];

export default function TripBookingsPage({ params }: any) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [trip, setTrip] = useState<ITrip | undefined>();
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const tripId = params.id;

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    fetchTrip(tripId);
  }, [loggedInAccount]);

  const fetchTrip = async (tripId: number): Promise<void> => {
    try {
      setTrip(await getTripDetails(Number(tripId)));
    } catch (e) {
      const axiosError = getAxiosError(e);
      if (axiosError === undefined) {
        setErrorCode(500);
      } else {
        setErrorCode(axiosError.statusCode);
      }
    }
  };

  const fetchVehicleBookings = async (pagination: PaginatedRequest) => {
    return getVehicleBookingsOfTrip(Number(tripId), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange } =
    useServerPagination<VehicleBookings>(fetchVehicleBookings, true);

  return (
    <div className={styles['main-container']}>
      {errorCode === undefined && (
        <>
          <Title level={1}>Vehicle Bookings</Title>
          <Spin
            size='large'
            spinning={trip === undefined}
            className={styles['spinner']}
          />
          {trip && (
            <>
              <div>
                <strong>Trip:</strong>&nbsp;{trip.srcPort?.name}&nbsp;to&nbsp;
                {trip.destPort?.name}
              </div>
              <div>
                <strong>Departure Date:</strong>&nbsp;
                {dayjs(trip.departureDateIso)
                  .tz('Asia/Shanghai')
                  .format('MM/DD/YYYY [at] h:mm A')}
              </div>
              <div>
                <strong>Voyage #:</strong>&nbsp;
                {trip.voyage?.number}
              </div>

              <Divider />
              <Table
                columns={bookingColumns}
                dataSource={dataInPage}
                loading={dataInPage === undefined}
                pagination={antdPagination}
                onChange={antdOnChange}
                rowKey={(booking) => booking.id}
              ></Table>
            </>
          )}
        </>
      )}
      {errorCode === 404 && (
        <p className={styles['error-text']}>
          The trip does not exist. Try again after a few minutes or&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=Trip Not Found`}
            className={styles['no-padding']}
          >
            contact us for assistance
          </Button>
          .
        </p>
      )}
      {errorCode === 403 && (
        <p className={styles['error-text']}>
          You are not authorized to view this page.&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=I cannot access vehicle bookings`}
            className={styles['no-padding']}
          >
            Contact us for assistance
          </Button>
          &nbsp;if you think this is a mistake.
        </p>
      )}
      {errorCode === 500 && (
        <p className={styles['error-text']}>Something went wrong.</p>
      )}
    </div>
  );
}
