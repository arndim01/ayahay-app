'use client';
import React, { useEffect, useState } from 'react';
import { IBookingTripPassenger } from '@ayahay/models';
import { getBookingTripPassengerById } from '@/services/booking.service';
import { useAuth } from '@/contexts/AuthContext';
import { getAxiosError } from '@ayahay/services/error.service';
import styles from '@/app/bookings/[id]/page.module.scss';
import BookingTripPassengerSummary from '@ayahay/components/descriptions/BookingTripPassengerSummary';
import { App, Button } from 'antd';
import {
  checkInPassenger,
  removeTripPassenger,
} from '@ayahay/services/booking.service';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';

const textCenter = { textAlign: 'center' };
const noPadding = { padding: '0' };

export default function BookingTripPassengerPage({ params }) {
  const { notification } = App.useApp();
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const [bookingTripPassenger, setBookingTripPassenger] = useState<
    IBookingTripPassenger | undefined
  >();
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const loadBookingTripPassenger = async () => {
    try {
      setBookingTripPassenger(
        await getBookingTripPassengerById(
          params.id,
          params.tripId,
          params.passengerId
        )
      );
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
    loadBookingTripPassenger();
  }, [loggedInAccount]);

  const removePassenger = async (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => {
    if (bookingTripPassenger === undefined) {
      return;
    }

    try {
      await removeTripPassenger(
        bookingTripPassenger.bookingId,
        bookingTripPassenger.tripId,
        bookingTripPassenger.passengerId,
        remarks,
        reasonType
      );
      notification.success({
        message: 'Passenger Removal Success',
        description:
          'This passenger has been removed from the booking successfully.',
      });
      loadBookingTripPassenger();
    } catch (e) {
      handleAxiosError(e, 'Passenger Removal Failed');
    }
  };

  const checkInBookingPassenger = async () => {
    if (bookingTripPassenger === undefined) {
      return;
    }

    try {
      await checkInPassenger(
        bookingTripPassenger.bookingId,
        bookingTripPassenger.tripId,
        bookingTripPassenger.passengerId
      );
      notification.success({
        message: 'Check In Success',
        description: 'The selected passenger has checked in successfully.',
      });
      loadBookingTripPassenger();
    } catch (e) {
      handleAxiosError(e, 'Check In Failed');
    }
  };

  const handleAxiosError = (e: any, errorTitle: string) => {
    const axiosError = getAxiosError<string>(e);
    // not an HTTP error
    const errorMessage = axiosError
      ? axiosError.message
      : 'Something went wrong.';
    notification.error({
      message: errorTitle,
      description: errorMessage,
    });
  };

  return (
    <div className={styles['main-container']}>
      {errorCode === undefined && (
        <BookingTripPassengerSummary
          bookingTripPassenger={bookingTripPassenger}
          hasPrivilegedAccess={hasPrivilegedAccess}
          canCheckIn={
            hasPrivilegedAccess ||
            loggedInAccount?.role === 'ShippingLineScanner'
          }
          onRemovePassenger={removePassenger}
          onCheckInPassenger={checkInBookingPassenger}
        />
      )}
      {errorCode === 404 && (
        <p style={textCenter}>
          The booking does not exist. Try again after a few minutes or&nbsp;
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
          You are not authorized to view this booking.&nbsp;
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
