import {
  Descriptions,
  Skeleton,
  Typography,
  Grid,
  QRCode,
  Button,
  Segmented,
} from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import {
  BOOKING_CANCELLATION_TYPE,
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from '@ayahay/constants';
import React, { useEffect, useState } from 'react';
import PaymentSummary from './PaymentSummary';
import { PrinterOutlined } from '@ant-design/icons';
import BookingCancellationModal from '../modals/BookingCancellationModal';
import BookingTripSummary from './BookingTripSummary';
import { combineBookingPaymentItems } from '@ayahay/services/booking.service';
import { toPhilippinesTime } from '@ayahay/services/date.service';
import { useBookingControls } from '@ayahay/hooks/booking';
import BookingReminders from './BookingReminders';
import { IPassenger, IVehicle } from '@ayahay/models';
import BookingTermsAndConditions from './BookingTermsAndConditions';
import BookingReceiptSummary from './BookingReceiptSummary';
import { getTermsAndConditionsForShippingLine } from '@ayahay/services/terms-and-conditions.service';
import { useSearchParams } from 'next/navigation';

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
  titleLevel: 1 | 2 | 3 | 4 | 5;
  hasPrivilegedAccess?: boolean;
  canCheckIn?: boolean;
  onPayBooking?: () => Promise<void>;
  onCancelBooking?: (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => Promise<void>;
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

export default function BookingSummary({
  booking,
  titleLevel,
  hasPrivilegedAccess,
  canCheckIn,
  onPayBooking,
  onCancelBooking,
  onCheckInPassenger,
  onUpdatePassenger,
  onRebookPassenger,
  onCheckInVehicle,
  onUpdateVehicle,
  onRebookVehicle,
}: BookingSummaryProps) {
  const screens = useBreakpoint();
  const searchParams = useSearchParams();

  // Add useEffect to handle automatic printing
  useEffect(() => {
    if (searchParams?.get('print') === 'true' && booking) {
      setIsThermalPrinting(true);
      // Wait for the DOM to update before printing
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams, booking]);

  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState(0);
  const [issuedBy, setIssuedBy] = useState('');
  const [termsAndConditionContent, setTermsAndConditionContent] = useState<string>('');

  const bookingTrip = booking?.bookingTrips?.[selectedTripIndex];
  const trip = bookingTrip?.trip;
  const bookingPaymentItems = booking
    ? combineBookingPaymentItems(booking)
    : [];

  // NEW: Fetch the Terms and Conditions for the shipping line
  useEffect(() => {
    if (booking && booking.shippingLine && booking.shippingLine.id) {
      getTermsAndConditionsForShippingLine(booking.shippingLine.id)
        .then((terms) => {
          if (terms && terms.content && terms.content.trim() !== '') {
            setTermsAndConditionContent(terms.content);
          } else {
            setTermsAndConditionContent('');
          }
        })
        .catch((error) => {
          console.error('Error fetching terms and conditions:', error);
          setTermsAndConditionContent('');
        });
    }
  }, [booking]);

  useEffect(() => {
    if (
      !booking?.createdByAccount ||
      booking.createdByAccount.role === 'Passenger'
    ) {
      setIssuedBy('Ayahay');
      return;
    }
    const { email, travelAgency, shippingLine } = booking.createdByAccount;
    const emailWithoutDomain = email.split('@')[0];
    if (travelAgency) {
      setIssuedBy(`${emailWithoutDomain} @ ${travelAgency.name}`);
    }
    if (shippingLine) {
      setIssuedBy(`${emailWithoutDomain} @ ${shippingLine.name}`);
    }
  }, [booking]);
  const {
    isThermalPrinting,
    setIsThermalPrinting,
    showQrCode,
    showCancelBookingButton,
    getUserAction,
  } = useBookingControls(booking, trip, hasPrivilegedAccess);

  const onClickCancel = (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => {
    setIsCancellationModalOpen(false);
    onCancelBooking && onCancelBooking(remarks, reasonType);
  };

  const selectTrip = (selectedTripId: number) => {
    if (!booking || !booking.bookingTrips) {
      return;
    }
    const tripIndex = booking.bookingTrips.findIndex(
      ({ tripId }) => tripId === selectedTripId
    );
    setSelectedTripIndex(tripIndex);
  };

  const payable =
    booking?.bookingStatus === 'Confirmed' &&
    booking?.paymentStatus === 'None' &&
    onPayBooking;

  const bookingActions = (
    <div style={{ display: 'flex', gap: '8px' }} className='hide-on-print'>
      {payable && (
        <Button type='primary' onClick={() => onPayBooking()}>
          Pay
        </Button>
      )}
      {hasPrivilegedAccess && (
        <Button type='primary' onClick={() => setIsThermalPrinting(true)}>
          <PrinterOutlined />
          Print Receipt
        </Button>
      )}
      {bookingTrip &&
        bookingTrip.bookingTripPassengers &&
        bookingTrip.bookingTripPassengers?.length > 0 && (
          <Button
            type='primary'
            href={`/bookings/${booking?.id}/itinerary`}
            target='_blank'
          >
            <PrinterOutlined />
            Print Itinerary
          </Button>
        )}
      {bookingTrip &&
        bookingTrip.bookingTripVehicles &&
        bookingTrip.bookingTripVehicles.length > 0 && (
          <Button
            type='primary'
            href={`/bookings/${booking.id}/bol`}
            target='_blank'
          >
            <PrinterOutlined />
            Print BOL
          </Button>
        )}
      {showCancelBookingButton && onCancelBooking && (
        <>
          <Button
            type='default'
            onClick={() => setIsCancellationModalOpen(true)}
          >
            Refund
          </Button>
          <BookingCancellationModal
            open={isCancellationModalOpen}
            onConfirmCancellation={(remarks, reasonType) =>
              onClickCancel(remarks, reasonType)
            }
            onCancel={() => setIsCancellationModalOpen(false)}
          ></BookingCancellationModal>
        </>
      )}
    </div>
  );

  const completeBookingSummary = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {booking && booking.bookingStatus === 'Confirmed' && (
        <section
          style={{
            display: 'flex',
            flexWrap: screens.lg ? 'nowrap' : 'wrap',
          }}
        >
          {showQrCode && (
            <article style={{ flexGrow: '1' }}>
              <p>{getUserAction()}</p>
              <QRCode
                value={window.location.href}
                size={screens.sm ? 256 : 192}
                viewBox={`0 0 256 256`}
                type='svg'
              />
            </article>
          )}
          <article style={{ flexGrow: '1', position: 'relative' }}>
            <Descriptions
              bordered={screens.sm}
              column={1}
              style={{ marginBottom: 40 }}
            >
              <Descriptions.Item label='Booking ID'>
                {booking.id.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Reference No'>
                {booking.referenceNo}
              </Descriptions.Item>
              <Descriptions.Item label='Issued By'>
                {issuedBy}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Status'>
                {BOOKING_STATUS[booking.bookingStatus]}
              </Descriptions.Item>
              <Descriptions.Item label='Payment Status'>
                {PAYMENT_STATUS[booking.paymentStatus]}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Date'>
                {toPhilippinesTime(
                  booking.createdAtIso,
                  'MMMM D, YYYY [at] h:mm A'
                )}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Reference No'>
                {booking.referenceNo}
              </Descriptions.Item>

              {booking.contactMobile && (
                <Descriptions.Item label='Contact Number'>
                  {booking.contactMobile}
                </Descriptions.Item>
              )}
              {booking.contactEmail && (
                <Descriptions.Item label='Email Address'>
                  {booking.contactEmail}
                </Descriptions.Item>
              )}
            </Descriptions>
            {bookingActions}
          </article>
        </section>
      )}

      {booking && booking.bookingTrips && booking.bookingTrips.length > 1 && (
        <Segmented
          size='large'
          options={booking.bookingTrips.map(({ trip }) => ({
            label: `${trip?.srcPort?.name} -> ${
              trip?.destPort?.name
            } (${toPhilippinesTime(trip.departureDateIso, 'MMM D, h:mm A')})`,
            value: trip?.id,
          }))}
          onChange={selectTrip}
          block
        />
      )}
      {bookingTrip && (
        <BookingTripSummary
          bookingTrip={bookingTrip}
          titleLevel={titleLevel}
          canCheckIn={canCheckIn}
          onCheckInPassenger={onCheckInPassenger}
          onUpdatePassenger={onUpdatePassenger}
          onRebookPassenger={onRebookPassenger}
          onCheckInVehicle={onCheckInVehicle}
          onUpdateVehicle={onUpdateVehicle}
          onRebookVehicle={onRebookVehicle}
        />
      )}
      {bookingPaymentItems.length > 0 && (
        <section id='payment-summary'>
          <Title level={titleLevel}>Payment Summary</Title>
          <PaymentSummary
            showTripColumn={
              booking?.bookingTrips && booking.bookingTrips.length > 1
            }
            paymentItems={bookingPaymentItems}
          />
        </section>
      )}
      <BookingReminders
        shippingLineName={trip?.shippingLine?.name}
        titleLevel={titleLevel}
      />
    </div>
  );

  let passengerName: string[] = [];
  let passengerFare: number[] = [];
  let vehiclePlateNoAndModelName: string[] = [];
  let vehicleFare: number[] = [];
  let routes = new Set<string>();

  const minimalBookingSummary = booking && (
    <div>
      {booking &&
        booking.bookingTrips &&
        booking.bookingTrips.map((bookingTrip, tripIndex) => (
          <div key={tripIndex}>
            {bookingTrip.bookingTripPassengers &&
              bookingTrip.bookingTripPassengers.map(
                (bookingTripPassenger, passengerIndex) => (
                  <div key={passengerIndex} style={{ breakBefore: 'page' }}>
                    <div style={{ display: 'none' }}>
                      {routes.add(
                        `${bookingTrip.trip?.srcPort?.name} - ${
                          bookingTrip.trip?.destPort?.name
                        } (${toPhilippinesTime(
                          bookingTrip.trip?.departureDateIso,
                          'MMM D, YYYY [at] h:mm A'
                        )})`
                      )}
                      {passengerName.push(
                        `${bookingTripPassenger.passenger?.firstName ?? ''} ${
                          bookingTripPassenger.passenger?.lastName ?? ''
                        }`
                      )}
                      {passengerFare.push(bookingTripPassenger.totalPrice ?? 0)}
                    </div>
                    <section>
                      <p>Ref # {booking.referenceNo}</p>
                      <QRCode
                        value={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${booking.id}/trips/${bookingTripPassenger.tripId}/passengers/${bookingTripPassenger.passengerId}`}
                        size={160}
                        viewBox={`0 0 256 256`}
                        type='svg'
                      />
                    </section>
                    <section>
                      <p>
                        {bookingTrip.trip?.srcPort?.name} -&nbsp;
                        {bookingTrip.trip?.destPort?.name}
                      </p>
                      <p>{booking.shippingLine?.name}</p>
                      <p>
                        {toPhilippinesTime(
                          bookingTrip.trip?.departureDateIso,
                          'MMM D, YYYY [at] h:mm A'
                        )}
                      </p>
                    </section>
                    <section>
                      <table style={{ tableLayout: 'fixed', width: '100%' }}>
                        <tbody>
                          <tr>
                            <td>
                              {bookingTripPassenger.passenger?.firstName}&nbsp;
                              {bookingTripPassenger.passenger?.lastName}
                            </td>
                            <td>₱{bookingTripPassenger.totalPrice}</td>
                          </tr>
                        </tbody>
                      </table>
                    </section>
                    <BookingTermsAndConditions TermsAndConditions={termsAndConditionContent}/>
                    <p style={{ textAlign: 'center' }}>Powered by AYAHAY</p>
                  </div>
                )
              )}
            {bookingTrip.bookingTripVehicles &&
              bookingTrip.bookingTripVehicles.map(
                (bookingTripVehicle, index) => (
                  <div key={index} style={{ breakBefore: 'page' }}>
                    <div style={{ display: 'none' }}>
                      {routes.add(
                        `${bookingTrip.trip?.srcPort?.name} - ${
                          bookingTrip.trip?.destPort?.name
                        } (${toPhilippinesTime(
                          bookingTrip.trip?.departureDateIso,
                          'MMM D, YYYY [at] h:mm A'
                        )})`
                      )}
                      {vehiclePlateNoAndModelName.push(
                        `${bookingTripVehicle.vehicle?.plateNo ?? ''} ${
                          bookingTripVehicle.vehicle?.modelName ?? ''
                        }`
                      )}
                      {vehicleFare.push(bookingTripVehicle.totalPrice ?? 0)}
                    </div>
                    <section>
                      <p>Ref # {booking.referenceNo}</p>
                      <QRCode
                        value={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${booking.id}/trips/${bookingTripVehicle.tripId}/vehicles/${bookingTripVehicle.vehicleId}`}
                        size={160}
                        viewBox={`0 0 256 256`}
                        type='svg'
                      />
                    </section>
                    <section>
                      <p>
                        {bookingTrip.trip?.srcPort?.name} -&nbsp;
                        {bookingTrip.trip?.destPort?.name}
                      </p>
                      <p>{booking.shippingLine?.name}</p>
                      <p>
                        {toPhilippinesTime(
                          bookingTrip.trip?.departureDateIso,
                          'MMM D, YYYY [at] h:mm A'
                        )}
                      </p>
                    </section>
                    <section>
                      <table style={{ tableLayout: 'fixed', width: '100%' }}>
                        <tbody>
                          <tr>
                            <td>{bookingTripVehicle.vehicle?.plateNo}</td>
                            <td>{bookingTripVehicle.vehicle?.modelName}</td>
                            <td>₱{bookingTripVehicle.totalPrice}</td>
                          </tr>
                        </tbody>
                      </table>
                    </section>
                    <BookingTermsAndConditions TermsAndConditions={termsAndConditionContent}/>
                    <p style={{ textAlign: 'center' }}>Powered by AYAHAY</p>
                  </div>
                )
              )}
          </div>
        ))}
      <BookingReceiptSummary
        bookingId={booking.id}
        passengerName={passengerName}
        passengerFare={passengerFare}
        vehiclePlateNoAndModelName={vehiclePlateNoAndModelName}
        vehicleFare={vehicleFare}
        routes={routes}
        shippingLineName={booking.shippingLine?.name ?? ''}
      />
    </div>
  );

  return (
    <>
      <Title level={1} style={isThermalPrinting && { display: 'none' }}>
        Booking Summary
      </Title>
      <Skeleton loading={booking === undefined} active>
        {isThermalPrinting && minimalBookingSummary}
        {!isThermalPrinting && completeBookingSummary}
      </Skeleton>
    </>
  );
}
