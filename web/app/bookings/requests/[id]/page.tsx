'use client';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingRequestById } from '@/services/booking.service';
import { IBooking } from '@ayahay/models/booking.model';
import { Button, Typography } from 'antd';
import { getAxiosError } from '@ayahay/services/error.service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getTrips } from '@ayahay/services/trip.service';

const { Title } = Typography;

const textCenter = { textAlign: 'center' };
const noPadding = { padding: '0' };

export default function BookingRequestPage({ params }) {
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const [booking, setBooking] = useState<IBooking | undefined>();
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const router = useRouter();

  const loadBooking = async () => {
    const bookingId = +params.id;
    try {
      const booking = await getBookingRequestById(bookingId);
      if (booking === undefined) {
        return;
      }
      if (booking.approvedByAccountId !== undefined) {
        // redirect to actual booking page if approved
        router.push(`/bookings/${booking.id}`);
        return;
      }
      if (booking.bookingTrips === undefined) {
        return;
      }
      const tripIds: any = booking.bookingTrips.map(
        (bookingTrip) => bookingTrip.tripId
      );
      const trips = await getTrips(tripIds);

      if (trips === undefined) {
        return;
      }
      booking.bookingTrips.forEach(
        (bookingTrip, index) => (bookingTrip.trip = trips[index])
      );
      setBooking(booking);
      setErrorCode(undefined);
    } catch (e) {
      const axiosError = getAxiosError(e);
      if (axiosError === undefined) {
        setErrorCode(500);
      } else {
        setErrorCode(axiosError.statusCode);
      }
    }
  };

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    loadBooking();
  }, [loggedInAccount]);

  return (
    <div style={{ padding: '32px' }}>
      {errorCode === undefined && (
        <>
          <Title level={1}>Booking Request</Title>
          <Title level={2}>Status: Waiting for Approval</Title>
          <BookingSummary
            booking={booking}
            titleLevel={2}
            hasPrivilegedAccess={hasPrivilegedAccess}
            canCheckIn={
              hasPrivilegedAccess ||
              loggedInAccount?.role === 'ShippingLineScanner'
            }
          />
        </>
      )}
      {errorCode === 404 && (
        <p style={textCenter}>
          The booking request does not exist. Try again after a few minutes
          or&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=Booking Not Found`}
            style={noPadding}
          >
            contact us for assistance
          </Button>
          .
        </p>
      )}
      {errorCode === 403 && (
        <p style={textCenter}>
          You are not authorized to view this booking request.&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=I cannot access my booking`}
            style={noPadding}
          >
            Contact us for assistance
          </Button>
          &nbsp;if you think this is a mistake.
        </p>
      )}
      {errorCode === 500 && <p style={textCenter}>Something went wrong.</p>}
    </div>
  );
}
