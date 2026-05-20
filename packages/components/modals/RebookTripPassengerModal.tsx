import { IBookingTrip, IBookingTripPassenger, ITrip } from '@ayahay/models';
import {
  Button,
  DatePicker,
  Flex,
  Modal,
  ModalProps,
  Popconfirm,
  Steps,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import TripSearchResults from '@ayahay/components/tables/TripSearchResults';
import { TripsSearchQuery } from '@ayahay/http';
import { createTentativeBooking } from '@ayahay/web/services/booking.service';
import BookingTripSummary from '../descriptions/BookingTripSummary';
import PaymentSummary from '../descriptions/PaymentSummary';
import { toPhilippinesTime } from '@ayahay/services/date.service';

const { Title } = Typography;

interface RebookTripPassengerModalProps {
  originalTrip?: IBookingTrip;
  tripPassenger?: IBookingTripPassenger;
  onRebookPassenger: (tempBookingId: number) => Promise<void>;
}

const steps = [{ title: 'Select New Trip' }, { title: 'Confirm Rebooking' }];

export default function RebookTripPassengerModal({
  originalTrip,
  tripPassenger,
  onRebookPassenger,
  onOk,
  ...modalProps
}: RebookTripPassengerModalProps & ModalProps) {
  const screens = useBreakpoint();
  const [currentStep, setCurrentStep] = useState(0);
  const [searchDateIso, setSearchDateIso] = useState<string>(
    new Date().toISOString()
  );
  const [tripQuery, setTripQuery] = useState<TripsSearchQuery | undefined>();
  const [newBookingTrip, setNewBookingTrip] = useState<
    IBookingTrip | undefined
  >();
  const [tempBookingId, setTempBookingId] = useState<number | undefined>();
  const stepDirection = screens.md ? 'horizontal' : 'vertical';

  useEffect(() => {
    if (!tripPassenger?.passenger || !originalTrip?.trip) {
      return;
    }

    setTripQuery({
      bookingType: 'Single',
      srcPortId: originalTrip.trip.srcPortId,
      destPortId: originalTrip.trip.destPortId,
      departureDate: searchDateIso,
      passengerCount: 1,
      vehicleCount: 0,
      shippingLineIds: [originalTrip.trip.shippingLineId],
      sort: 'departureDate',
    });
  }, [tripPassenger, searchDateIso]);

  useEffect(() => {
    resetTripSelection();
  }, [tripPassenger]);

  const selectTrip = async (trip: ITrip) => {
    if (!tripPassenger) {
      return;
    }

    const tempBooking = await createTentativeBooking({
      bookingType: 'Single',
      bookingTrips: [
        {
          tripId: trip.id,
          trip,
          bookingTripPassengers: [
            {
              tripId: trip.id,
              passengerId: tripPassenger.passengerId,
              passenger: tripPassenger.passenger,
              discountType: tripPassenger.discountType,
            },
          ],
          bookingTripVehicles: [],
        },
      ],
    } as any);

    const newTrip = tempBooking.bookingTrips?.[0];
    const newTripPassenger = newTrip?.bookingTripPassengers?.[0];
    const oldPaymentItems = tripPassenger?.bookingPaymentItems;

    if (!newTrip || !newTripPassenger || !oldPaymentItems) {
      return;
    }

    const oldFare = oldPaymentItems.find(paymentItem => paymentItem.type === 'Fare');
    if (oldFare !== undefined && oldFare.price > 0) {
      newTripPassenger.bookingPaymentItems?.push({
        description: `Refund old fare`,
        type: 'CancellationRefund',
        price: -oldFare.price,
      } as any);
    }
    
    setNewBookingTrip({
      tripId: newTrip.tripId,
      trip: newTrip.trip,
      bookingTripPassengers: [newTripPassenger],
      bookingTripVehicles: [],
    } as any);
    setCurrentStep(1);
    setTempBookingId(Number(tempBooking.id));
  };

  const resetTripSelection = () => {
    setCurrentStep(0);
    setTempBookingId(undefined);
    setNewBookingTrip(undefined);
  };

  return (
    <Modal centered closeIcon={true} footer={null} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px', marginBottom: '16px' }}>
        Rebook Trip Passenger
      </Title>
      <p style={{ fontSize: '16px', marginBottom: '20px' }}>
        You are rebooking&nbsp;
        {tripPassenger?.passenger?.firstName}&nbsp;
        {tripPassenger?.passenger?.lastName}'s&nbsp;
        {toPhilippinesTime(
          originalTrip?.trip?.departureDateIso,
          'MMM DD, h:mm A'
        )}
        &nbsp;
        {originalTrip?.trip?.srcPort?.name} -&gt;&nbsp;
        {originalTrip?.trip?.destPort?.name} trip.
      </p>
      <Steps
        current={currentStep}
        items={steps.map(({ title }) => ({ key: title, title: title }))}
        direction={stepDirection}
        labelPlacement={stepDirection}
        style={{ marginBottom: '20px' }}
      />
      {currentStep === 0 && tripQuery && (
        <>
          <p>
            Showing&nbsp;
            {originalTrip?.trip?.srcPort?.name} -&gt;&nbsp;
            {originalTrip?.trip?.destPort?.name} trips for
          </p>
          <DatePicker
            defaultValue={dayjs(searchDateIso)}
            disabledDate={(current) => current < dayjs().startOf('day')}
            onChange={(date, _) => setSearchDateIso(date.toISOString())}
            format='MMM D, YYYY'
            allowClear={false}
            size='large'
            style={{ margin: '8px 0 20px' }}
          />
          <TripSearchResults
            searchQuery={tripQuery}
            excludeTripId={tripPassenger?.tripId}
            onSelectTrip={(trip) => selectTrip(trip)}
          />
        </>
      )}
      {currentStep === 1 && newBookingTrip && tempBookingId && (
        <>
          <BookingTripSummary titleLevel={2} bookingTrip={newBookingTrip} />
          <section style={{ margin: '24px 0' }}>
            <Title level={3}>Payment Summary</Title>
            <PaymentSummary
              paymentItems={
                newBookingTrip?.bookingTripPassengers?.[0]?.bookingPaymentItems
              }
            />
          </section>
          <Flex gap={8} justify='flex-end'>
            <Button type='default' onClick={() => resetTripSelection()}>
              Choose another trip
            </Button>
            <Popconfirm
              title='Confirm Rebooking'
              description='This action cannot be undone.'
              onConfirm={() => onRebookPassenger(tempBookingId)}
              okText='Confirm'
              cancelText='No'
            >
              <Button type='primary'>Rebook</Button>
            </Popconfirm>
          </Flex>
        </>
      )}
    </Modal>
  );
}
