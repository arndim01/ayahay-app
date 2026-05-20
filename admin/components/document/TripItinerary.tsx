import { IBooking, IBookingTripPassenger, ITrip } from '@ayahay/models';
import React from 'react';
import { Flex, QRCode } from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { BlankUnderline } from './BillOfLadingReport';
import BookingReminders from '@ayahay/components/descriptions/BookingReminders';

dayjs.extend(timezone);
dayjs.extend(utc);

interface TripItineraryProps {
  booking: IBooking;
}

export default function TripItinerary({ booking }: TripItineraryProps) {
  return booking.bookingTrips?.map(({ trip, bookingTripPassengers }) => (
    <>
      {bookingTripPassengers?.map((tripPassenger) => (
        <div
          key={tripPassenger.tripId + '' + tripPassenger.passengerId}
          style={{ breakBefore: 'page' }}
        >
          <ItineraryContent
            booking={booking}
            trip={trip}
            tripPassenger={tripPassenger}
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
              tripPassenger={tripPassenger}
            />
          </div>
        </div>
      ))}
    </>
  ));
}

interface ItineraryContentProps {
  booking: IBooking;
  trip: ITrip | undefined;
  tripPassenger: IBookingTripPassenger;
}

export function ItineraryContent({
  booking,
  trip,
  tripPassenger,
}: ItineraryContentProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;

  const ticketPriceOfPax =
    booking.voucherCode === 'COLLECT_BOOKING'
      ? tripPassenger.bookingPaymentItems?.find(
          (paymentItem) => paymentItem.type === 'Fare'
        )?.price
      : tripPassenger.bookingPaymentItems?.reduce(
          (sum, curr) => sum + curr.price,
          0
        );

  return (
    <>
      <Flex justify='space-between'>
        <section
          className='shipping-line-details'
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={`${SHIPPING_LINE_LOGO}${trip?.shippingLine?.logoFilename}`}
            alt='Logo'
            height={80}
          />
          <span
            style={{
              fontWeight: 'bold',
            }}
          >
            {trip?.shippingLine?.name}
          </span>
        </section>
        <section
          className='trip-details'
          style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          <img src={`/assets/ayahay-logo.png`} alt='Logo' height={80} />
          <span
            style={{
              fontWeight: 'bold',
            }}
          >
            Ayahay Technology Corp
          </span>
        </section>
      </Flex>
      <BlankUnderline width='100%' />
      <Flex justify='space-between'>
        <section
          className='passenger'
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontWeight: 'bold' }}>Passenger</span>
          <span>
            <strong>Name:</strong> {tripPassenger.passenger?.firstName}
            &nbsp;
            {tripPassenger.passenger?.lastName}
          </span>
          <span>
            <strong>Accommodation:</strong>&nbsp;
            {tripPassenger.cabin?.cabinType?.name ?? ''}
          </span>
          {tripPassenger.seat?.name && (
            <span>
              <strong>Seat:</strong>&nbsp;
              {tripPassenger.seat?.name}&nbsp;(
              {tripPassenger.seat?.seatType?.name ?? ''})
            </span>
          )}
        </section>
        <section
          className='booking-details'
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontWeight: 'bold' }}>Booking Details</span>
          <span>
            <strong>Trip:</strong> {trip?.srcPort?.name} -&nbsp;
            {trip?.destPort?.name}&nbsp;
          </span>
          <span>
            <strong>Reference No.:</strong>&nbsp;
            {booking.referenceNo}
          </span>
          <span>
            <strong>Departure Date:</strong>&nbsp;
            {dayjs(trip?.departureDateIso)
              .tz('Asia/Shanghai')
              .format('MMM D, YYYY [at] h:mm A')}
          </span>
          <span>
            <strong>Booking Date:</strong>&nbsp;
            {dayjs(booking.createdAtIso)
              .tz('Asia/Shanghai')
              .format('MMM D, YYYY [at] h:mm A')}
          </span>
        </section>
        <section className='qr-code'>
          <span>DO NOT FOLD THIS IMAGE</span>
          <QRCode
            value={`${process.env.NEXT_PUBLIC_ADMIN_URL}/bookings/${booking.id}/trips/${tripPassenger.tripId}/passengers/${tripPassenger.passengerId}`}
            size={160}
            viewBox={`0 0 256 256`}
            type='svg'
          />
          <span>
            <strong>Ticket Price:</strong> {ticketPriceOfPax}
          </span>
        </section>
      </Flex>
    </>
  );
}
