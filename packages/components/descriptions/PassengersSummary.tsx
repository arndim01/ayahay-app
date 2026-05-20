import React, { useEffect, useState } from 'react';
import { Button, Badge, Flex } from 'antd';
import {
  IBookingTrip,
  IBookingTripPassenger,
  IPassenger,
} from '@ayahay/models';
import { DISCOUNT_TYPE } from '@ayahay/constants/enum';
import Table, { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  ExportOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/plugin/relativeTime';
import RebookTripPassengerModal from '../modals/RebookTripPassengerModal';
import UpdateTripPassengerModal from '../modals/UpdateTripPassengerModal';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

interface PassengersSummaryProps {
  bookingTrip?: IBookingTrip;
  passengers?: IBookingTripPassenger[];
  canCheckIn?: boolean;
  onCheckInPassenger?: (tripId: number, passengerId: number) => Promise<void>;
  onUpdatePassenger?: (
    tripId: number,
    passengerId: number,
    passenger: IPassenger
  ) => Promise<void>;
  onRebookPassenger?: (
    tripId: number,
    passengerId: number,
    tempBookingId: number
  ) => Promise<void>;
}

const passengerColumnsWithoutActions: ColumnsType<IBookingTripPassenger> = [
  {
    title: 'Name',
    render: (_, { passenger, discountType }) => {
      const name = `${passenger?.sex === 'Male' ? 'MR' : 'MS'} ${
        passenger?.firstName
      } ${passenger?.lastName}`;
      return (
        <div>
          <strong>{name}</strong>
          <p>{discountType ? DISCOUNT_TYPE[discountType] : 'Adult'}</p>
        </div>
      );
    },
  },
  {
    title: 'Accommodation',
    key: 'accommodation',
    render: (_, { cabin, seat }) => (
      <>
        {cabin && (
          <span>
            {cabin.name ?? ''} ({cabin.cabinType?.name ?? ''})
          </span>
        )}
        <br />
        {seat && (
          <span>
            {seat.name ?? ''} ({seat.seatType?.name ?? ''})
          </span>
        )}
      </>
    ),
  },
];

export default function PassengersSummary({
  bookingTrip,
  passengers,
  canCheckIn,
  onCheckInPassenger,
  onUpdatePassenger,
  onRebookPassenger,
}: PassengersSummaryProps) {
  const [passengerModalOpen, setPassengerModalOpen] = useState<boolean>(false);
  const [rebookPassengerModalOpen, setRebookPassengerModalOpen] =
    useState<boolean>(false);
  const [selectedTripPassenger, setSelectedTripPassenger] = useState<
    IBookingTripPassenger | undefined
  >();
  const [passengerColumns, setPassengerColumns] = useState<
    ColumnsType<IBookingTripPassenger>
  >(passengerColumnsWithoutActions);

  useEffect(() => {
    if (passengers === undefined) {
      return;
    }

    const columns = [...passengerColumnsWithoutActions];

    if (canCheckIn) {
      columns.push({
        title: 'Check-In Status',
        render: (_, passenger) => {
          if (passenger.checkInDate === undefined) {
            return (
              <Button
                type='primary'
                onClick={() =>
                  onCheckInPassenger &&
                  onCheckInPassenger(passenger.tripId, passenger.passengerId)
                }
              >
                Check In
              </Button>
            );
          }

          const checkInDateFromNow = dayjs(passenger.checkInDate).fromNow();
          return (
            <Badge status='success' text={`Checked in ${checkInDateFromNow}`} />
          );
        },
      });
    }
    columns.push({
      title: 'Actions',
      render: (_, passenger) => (
        <Flex gap={8}>
          {canCheckIn && onUpdatePassenger && (
            <Button
              type='primary'
              onClick={() => {
                setSelectedTripPassenger(passenger);
                setPassengerModalOpen(true);
              }}
              icon={<EditOutlined />}
            />
          )}
          {canCheckIn && onRebookPassenger && (
            <Button
              type='primary'
              onClick={() => {
                setSelectedTripPassenger(passenger);
                setRebookPassengerModalOpen(true);
              }}
              icon={<RollbackOutlined />}
            />
          )}
          {passenger.bookingId && (
            <Button
              type='default'
              href={`/bookings/${passenger.bookingId}/trips/${passenger.tripId}/passengers/${passenger.passengerId}`}
              target='_blank'
              icon={<ExportOutlined />}
            />
          )}
        </Flex>
      ),
    });

    setPassengerColumns(columns);
  }, [passengers]);

  const updateTripPassenger = async (passenger: IPassenger): Promise<void> => {
    if (!selectedTripPassenger || !onUpdatePassenger) {
      return;
    }
    await onUpdatePassenger(
      selectedTripPassenger.tripId,
      selectedTripPassenger.passengerId,
      passenger
    );
    setPassengerModalOpen(false);
  };

  const rebookTripPassenger = async (tempBookingId: number): Promise<void> => {
    if (!selectedTripPassenger || !onRebookPassenger) {
      return;
    }
    await onRebookPassenger(
      selectedTripPassenger.tripId,
      selectedTripPassenger.passengerId,
      tempBookingId
    );
    setRebookPassengerModalOpen(false);
  };

  return (
    <>
      <Table
        columns={passengerColumns}
        dataSource={passengers}
        pagination={false}
        loading={passengers === undefined}
        tableLayout='fixed'
        rowKey={({ passengerId }) => passengerId}
      ></Table>
      {onUpdatePassenger && (
        <UpdateTripPassengerModal
          open={passengerModalOpen}
          originalTripPassenger={selectedTripPassenger}
          onUpdatePassenger={(passenger) => updateTripPassenger(passenger)}
          onCancel={() => setPassengerModalOpen(false)}
          width={300}
        />
      )}
      {onRebookPassenger && (
        <RebookTripPassengerModal
          open={rebookPassengerModalOpen}
          originalTrip={bookingTrip}
          tripPassenger={selectedTripPassenger}
          onRebookPassenger={(tempBookingId) =>
            rebookTripPassenger(tempBookingId)
          }
          onCancel={() => setRebookPassengerModalOpen(false)}
          width={1024}
        />
      )}
    </>
  );
}
