import React, { useEffect, useState } from 'react';
import { Button, Badge, Flex } from 'antd';
import { IBookingTrip, IBookingTripVehicle, IVehicle } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { EditOutlined, ExportOutlined, RollbackOutlined } from '@ant-design/icons';
import UpdateTripVehicleModal from '../modals/UpdateTripVehicleModal';
import RebookTripVehicleModal from '../modals/RebookTripVehicleModal';

interface VehiclesSummaryProps {
  bookingTrip?: IBookingTrip;
  vehicles?: IBookingTripVehicle[];
  canCheckIn?: boolean;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
  onUpdateVehicle?: (
    tripId: number,
    vehicleId: number,
    vehicle: IVehicle
  ) => Promise<void>;
  onRebookVehicle?: (
    tripId: number,
    vehicleId: number,
    tempBookingId: number
  ) => Promise<void>;
}

const vehicleColumnsWithoutActions: ColumnsType<IBookingTripVehicle> = [
  {
    title: 'Name',
    render: (_, { vehicle }) => {
      return (
        <div>
          <strong>{vehicle?.plateNo}</strong>
          <p>{vehicle?.modelName}</p>
        </div>
      );
    },
  },
  {
    title: 'Type',
    key: 'vehicleTypeName',
    render: (_, { vehicle }) => vehicle?.vehicleType?.name,
  },
];

export default function VehiclesSummary({
  bookingTrip,
  vehicles,
  canCheckIn,
  onCheckInVehicle,
  onUpdateVehicle,
  onRebookVehicle,
}: VehiclesSummaryProps) {
  const [vehicleModalOpen, setVehicleModalOpen] = useState<boolean>(false);
  const [rebookVehicleModalOpen, setRebookVehicleModalOpen] =
    useState<boolean>(false);
  const [selectedTripVehicle, setSelectedTripVehicle] = useState<
    IBookingTripVehicle | undefined
  >();
  const [vehicleColumns, setVehicleColumns] = useState<
    ColumnsType<IBookingTripVehicle>
  >(vehicleColumnsWithoutActions);

  useEffect(() => {
    if (vehicles === undefined) {
      return;
    }

    const columns = [...vehicleColumnsWithoutActions];

    if (canCheckIn) {
      columns.push({
        title: 'Check-In Status',
        render: (_, vehicle) => {
          if (vehicle.checkInDate === undefined) {
            return (
              <Button
                type='primary'
                onClick={() =>
                  onCheckInVehicle &&
                  onCheckInVehicle(vehicle.tripId, vehicle.vehicleId)
                }
              >
                Check In
              </Button>
            );
          }

          const checkInDateFromNow = dayjs(vehicle.checkInDate).fromNow();
          return (
            <Badge status='success' text={`Checked in ${checkInDateFromNow}`} />
          );
        },
      });
    }
    columns.push({
      title: 'Actions',
      render: (_, vehicle) => (
        <Flex gap={8}>
          {canCheckIn && onUpdateVehicle && (
            <Button
              type='primary'
              onClick={() => {
                setSelectedTripVehicle(vehicle);
                setVehicleModalOpen(true);
              }}
              icon={<EditOutlined />}
            />
          )}
          {canCheckIn && onRebookVehicle && (
            <Button
              type='primary'
              onClick={() => {
                setSelectedTripVehicle(vehicle);
                setRebookVehicleModalOpen(true);
              }}
              icon={<RollbackOutlined />}
            />
          )}
          {vehicle.bookingId && (
            <Button
              type='default'
              href={`/bookings/${vehicle.bookingId}/trips/${vehicle.tripId}/vehicles/${vehicle.vehicleId}`}
              target='_blank'
              icon={<ExportOutlined />}
            />
          )}
        </Flex>
      ),
    });

    setVehicleColumns(columns);
  }, [vehicles]);

  const updateTripVehicle = async (vehicle: IVehicle): Promise<void> => {
    if (!selectedTripVehicle || !onUpdateVehicle) {
      return;
    }
    await onUpdateVehicle(
      selectedTripVehicle.tripId,
      selectedTripVehicle.vehicleId,
      vehicle
    );
    setVehicleModalOpen(false);
  };

  const rebookTripVehicle = async (tempBookingId: number): Promise<void> => {
    if (!selectedTripVehicle || !onRebookVehicle) {
      return;
    }
    await onRebookVehicle(
      selectedTripVehicle.tripId,
      selectedTripVehicle.vehicleId,
      tempBookingId
    );
    setRebookVehicleModalOpen(false);
  };
  
  return (
    <>
      <Table
        columns={vehicleColumns}
        dataSource={vehicles}
        pagination={false}
        loading={vehicles === undefined}
        tableLayout='fixed'
      ></Table>
      {onUpdateVehicle && (
        <UpdateTripVehicleModal
          open={vehicleModalOpen}
          originalTripVehicle={selectedTripVehicle}
          onUpdateVehicle={(vehicle) => updateTripVehicle(vehicle)}
          onCancel={() => setVehicleModalOpen(false)}
          width={300}
        />
      )}
      {onRebookVehicle && (
        <RebookTripVehicleModal
          open={rebookVehicleModalOpen}
          originalTrip={bookingTrip}
          tripVehicle={selectedTripVehicle}
          onRebookVehicle={(tempBookingId) =>
            rebookTripVehicle(tempBookingId)
          }
          onCancel={() => setRebookVehicleModalOpen(false)}
          width={1024}
        />
      )}
    </>
  );
}
