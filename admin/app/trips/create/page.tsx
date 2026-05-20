'use client';
import React, { useEffect, useState } from 'react';
import { IShippingLineSchedule } from '@ayahay/models';
import { getSchedulesOfShippingLine } from '@/services/shipping-line.service';
import { Typography } from 'antd';
import CreateTripsFromScheduleForm from './createTripsFromScheduleForm';
import { useAuthGuard } from '@/hooks/auth';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

export default function CreateTripsFromSchedulesPage() {
  useAuthGuard(['ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [schedules, setSchedules] = useState<IShippingLineSchedule[]>([]);

  const fetchSchedules = async (): Promise<void> => {
    if (!loggedInAccount?.shippingLineId) {
      return;
    }

    const shippingLineSchedules = await getSchedulesOfShippingLine(
      loggedInAccount.shippingLineId
    );
    if (shippingLineSchedules === undefined) {
      return;
    }

    setSchedules(shippingLineSchedules);
  };

  useEffect(() => {
    fetchSchedules();
  }, [loggedInAccount]);

  return (
    <div style={{ margin: '32px 64px' }}>
      <Title level={1}>Create Trips from Schedules</Title>
      <CreateTripsFromScheduleForm schedules={schedules} />
    </div>
  );
}
