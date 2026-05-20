'use client';
import TripItinerary from '@/components/document/TripItinerary';
import { getBookingById } from '@/services/booking.service';
import { PrinterOutlined } from '@ant-design/icons';
import { IBooking } from '@ayahay/models';
import { FloatButton, Skeleton } from 'antd';
import { useEffect, useState } from 'react';

export default function ItineraryPage({ params }: any) {
  const [data, setData] = useState<IBooking>();
  const bookingId = params.id;

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async (): Promise<void> => {
    const booking = await getBookingById(bookingId);
    setData(booking);
  };

  return (
    <div>
      <Skeleton loading={data === undefined}>
        <TripItinerary booking={data} />
      </Skeleton>

      <FloatButton
        className='hide-on-print'
        type='primary'
        onClick={() => window.print()}
        icon={<PrinterOutlined height={72} width={72} />}
      ></FloatButton>
    </div>
  );
}
