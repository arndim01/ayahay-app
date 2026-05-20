'use client';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from 'antd';

export default function GetBookings() {
  const searchParams = useSearchParams();

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());

    if (params.txnid !== undefined) {
      redirect(`/bookings/${params.txnid}`);
    }

    redirect('/404');
  };

  useEffect(onPageLoad, []);

  return <Skeleton />;
}
