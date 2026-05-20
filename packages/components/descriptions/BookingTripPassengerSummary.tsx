import React, { useEffect, useState } from 'react';
import TripSummary from './TripSummary';
import {
  Badge,
  Button,
  Descriptions,
  QRCode,
  Skeleton,
  Typography,
} from 'antd';
import { IBookingTripPassenger } from '@ayahay/models';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useBookingControls } from '@ayahay/hooks/booking';
import BookingCancellationModal from '../modals/BookingCancellationModal';
import {
  BOOKING_CANCELLATION_TYPE,
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from '@ayahay/constants';
import PaymentSummary from './PaymentSummary';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import { ItineraryContent } from '@/components/document/TripItinerary';
import BookingReminders from './BookingReminders';
import { toPhilippinesTime, fromNow } from '@ayahay/services/date.service';
import BookingTermsAndConditions from './BookingTermsAndConditions';

const { Title } = Typography;

interface BookingTripPassengerSummaryProps {
  bookingTripPassenger?: IBookingTripPassenger;
  hasPrivilegedAccess?: boolean;
  canCheckIn?: boolean;
  onCheckInPassenger: () => Promise<void>;
  onRemovePassenger: (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => Promise<void>;
}

export default function BookingTripPassengerSummary({
  bookingTripPassenger,
  hasPrivilegedAccess,
  canCheckIn,
  onCheckInPassenger,
  onRemovePassenger,
}: BookingTripPassengerSummaryProps) {
  const screens = useBreakpoint();
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isItineraryPrinting, setIsItineraryPrinting] = useState(false);
  const booking = bookingTripPassenger?.booking;
  const trip = bookingTripPassenger?.trip;
  const passenger = bookingTripPassenger?.passenger;
  const bookingPaymentItems = bookingTripPassenger?.bookingPaymentItems;

  const {
    isThermalPrinting,
    setIsThermalPrinting,
    showQrCode,
    showCancelBookingButton,
    getUserAction,
  } = useBookingControls(booking, trip, hasPrivilegedAccess);

  useEffect(() => {
    if (isItineraryPrinting) {
      window.print();
      setIsItineraryPrinting(false);
    }
  }, [isItineraryPrinting]);

  const onClickRemove = (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => {
    setIsRemoveModalOpen(false);
    onRemovePassenger(remarks, reasonType);
  };

  const bookingActions = (
    <div style={{ display: 'flex', gap: '8px' }} className='hide-on-print'>
      <Button type='primary' onClick={() => setIsThermalPrinting(true)}>
        <PrinterOutlined />
        Print Receipt
      </Button>
      <Button type='primary' onClick={() => setIsItineraryPrinting(true)}>
        <PrinterOutlined />
        Print Itinerary
      </Button>
      {canCheckIn && bookingTripPassenger?.checkInDate === undefined && (
        <Button type='primary' onClick={() => onCheckInPassenger()}>
          Check-In Passenger
        </Button>
      )}
      {showCancelBookingButton && (
        <>
          <Button
            type='primary'
            danger
            onClick={() => setIsRemoveModalOpen(true)}
          >
            Remove Passenger
          </Button>
          <BookingCancellationModal
            open={isRemoveModalOpen}
            onConfirmCancellation={(remarks, reasonType) =>
              onClickRemove(remarks, reasonType)
            }
            onCancel={() => setIsRemoveModalOpen(false)}
          ></BookingCancellationModal>
        </>
      )}
    </div>
  );

  const completeSummary = booking && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Button
        type='link'
        href={`/bookings/${booking?.id}`}
        icon={<ArrowLeftOutlined />}
        style={{ alignSelf: 'start' }}
      >
        Booking Summary
      </Button>
      <Title level={1}>Booking Details</Title>
      <section
        style={{
          display: 'flex',
          flexWrap: screens.lg ? 'nowrap' : 'wrap',
        }}
      >
        {showQrCode && bookingTripPassenger.removedReason === undefined && (
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
            <Descriptions.Item label='Passenger Name'>
              {passenger?.firstName} {passenger?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label='Status'>
              {bookingTripPassenger.removedReason !== undefined ? (
                <Badge
                  status='error'
                  text={`Removed due to ${bookingTripPassenger.removedReason}`}
                />
              ) : bookingTripPassenger.checkInDate ? (
                <Badge
                  status='success'
                  text={`Checked in ${fromNow(
                    bookingTripPassenger.checkInDate
                  )}`}
                />
              ) : (
                <Badge status='default' text='Not checked in' />
              )}
            </Descriptions.Item>
          </Descriptions>
          {bookingTripPassenger.removedReason === undefined && bookingActions}
        </article>
      </section>
      <section id='trip-summary'>
        <Title level={2}>Trip Details</Title>
        <TripSummary trip={trip} />
      </section>
      <section id='payment-summary'>
        <Title level={2}>Payment Summary</Title>
        <PaymentSummary paymentItems={bookingPaymentItems} />
      </section>
    </div>
  );

  const minimalSummary = booking && (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {showQrCode && (
        <section>
          <p>Ref # {booking.referenceNo}</p>
          <QRCode
            value={window.location.href}
            size={160}
            viewBox={`0 0 256 256`}
            type='svg'
          />
        </section>
      )}
      {trip && (
        <section>
          <p>
            {trip.srcPort?.name} - {trip.destPort?.name}
          </p>
          <p>
            {toPhilippinesTime(
              trip.departureDateIso,
              'MMM D, YYYY [at] h:mm A'
            )}
          </p>
        </section>
      )}
      <section>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <tbody>
            <tr>
              <td>
                {bookingTripPassenger?.passenger?.firstName}&nbsp;
                {bookingTripPassenger?.passenger?.lastName}
              </td>
              <td>₱{bookingTripPassenger?.totalPrice}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <BookingTermsAndConditions />
      <p style={{ textAlign: 'center' }}>Powered by AYAHAY</p>
    </div>
  );

  const paxItinerary = booking && (
    <div>
      <ItineraryContent
        booking={booking}
        trip={trip}
        tripPassenger={bookingTripPassenger}
      />
      <div style={{ marginTop: 10 }}>
        <BookingReminders
          shippingLineName={trip?.shippingLine?.name}
          titleLevel={5}
          fontSize={10}
        />
      </div>
      <span
        style={{
          width: '100%',
          display: 'inline-block',
          borderBottom: '1px dashed black',
          textAlign: 'center',
          fontSize: 8,
        }}
      >
        CUT THIS AREA (VESSEL COPY)
      </span>
      <div style={{ marginTop: 10 }}>
        <ItineraryContent
          booking={booking}
          trip={trip}
          tripPassenger={bookingTripPassenger}
        />
      </div>
    </div>
  );

  return (
    <Skeleton loading={bookingTripPassenger === undefined} active>
      {isThermalPrinting && minimalSummary}
      {isItineraryPrinting && paxItinerary}
      {!isThermalPrinting && !isItineraryPrinting && completeSummary}
    </Skeleton>
  );
}
