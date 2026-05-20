import { IBooking, ITrip } from '@ayahay/models';
import { useEffect, useState } from 'react';

export function useBookingControls(
  booking: IBooking | undefined,
  trip: ITrip | undefined,
  hasPrivilegedAccess: boolean | undefined
) {
  const [isThermalPrinting, setIsThermalPrinting] = useState(false);

  useEffect(() => {
    if (isThermalPrinting) {
      window.print();
      setIsThermalPrinting(false);
    }
  }, [isThermalPrinting]);

  const showQrCode =
    booking?.bookingStatus === 'Confirmed' &&
    booking?.paymentStatus === 'Success' &&
    trip?.status === 'Awaiting';

  const showCancelBookingButton =
    booking?.bookingStatus === 'Confirmed' && hasPrivilegedAccess;

  const getUserAction = () => {
    if (booking === undefined) {
      return '';
    }

    switch (booking.paymentStatus) {
      case 'Pending':
        return 'The QR code will be available after your payment has been processed.';
      case 'Success':
        return 'Show this QR code to the person in charge to verify your booking';
    }
    return '';
  };

  return {
    isThermalPrinting,
    setIsThermalPrinting,
    showQrCode,
    showCancelBookingButton,
    getUserAction,
  };
}
