import { IBookingTrip, IPassenger, IVehicle } from '@ayahay/models';
import { Flex, Typography } from 'antd';
import React from 'react';
import TripSummary from './TripSummary';
import PassengersSummary from './PassengersSummary';
import VehiclesSummary from './VehiclesSummary';

const { Title } = Typography;

interface BookingTripSummaryProps {
  bookingTrip: IBookingTrip;
  titleLevel: 1 | 2 | 3 | 4 | 5;
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

export default function BookingTripSummary({
  bookingTrip,
  titleLevel,
  canCheckIn,
  onCheckInPassenger,
  onUpdatePassenger,
  onRebookPassenger,
  onCheckInVehicle,
  onUpdateVehicle,
  onRebookVehicle,
}: BookingTripSummaryProps) {
  return (
    <Flex vertical gap={24}>
      <section>
        <Title level={titleLevel}>Trip Itinerary</Title>
        <TripSummary trip={bookingTrip.trip} />
      </section>
      {bookingTrip.bookingTripPassengers &&
        bookingTrip.bookingTripPassengers.length > 0 && (
          <section>
            <Title level={titleLevel + 1}>Passengers</Title>
            <PassengersSummary
              bookingTrip={bookingTrip}
              passengers={bookingTrip.bookingTripPassengers}
              canCheckIn={canCheckIn}
              onCheckInPassenger={onCheckInPassenger}
              onUpdatePassenger={onUpdatePassenger}
              onRebookPassenger={onRebookPassenger}
            />
          </section>
        )}
      {bookingTrip.bookingTripVehicles &&
        bookingTrip.bookingTripVehicles.length > 0 && (
          <section>
            <Title level={titleLevel + 1}>Vehicles</Title>
            <VehiclesSummary
              bookingTrip={bookingTrip}
              vehicles={bookingTrip.bookingTripVehicles}
              canCheckIn={canCheckIn}
              onCheckInVehicle={onCheckInVehicle}
              onUpdateVehicle={onUpdateVehicle}
              onRebookVehicle={onRebookVehicle}
            />
          </section>
        )}
    </Flex>
  );
}
