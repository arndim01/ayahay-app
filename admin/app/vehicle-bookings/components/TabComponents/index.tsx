'use client';
import { Tabs, TabsProps } from 'antd';
import { VehicleBookingData } from './types';
import AllBookingsTab from './AllBookingsTab';
import OnBoardedTab from './OnBoardedTab';
import NotBoardedTab from './NotBoardedTab';
import styles from './tabs.module.scss';
import { useEffect, useState } from 'react';

interface BookingTabsProps {
  tripId: string;
  onExport: (data: VehicleBookingData[]) => void;
}

export default function BookingTabs({ tripId, onExport }: BookingTabsProps) {
  const [currentData, setCurrentData] = useState<VehicleBookingData[]>([]);

  const handleDataLoaded = (data: VehicleBookingData[]) => {
    setCurrentData(data);
  };

  useEffect(() => {
    const handleExport = () => {
      if (currentData.length > 0) {
        onExport(currentData);
      }
    };

    document.addEventListener('export-bookings', handleExport);
    return () => document.removeEventListener('export-bookings', handleExport);
  }, [currentData, onExport]);

  const items: TabsProps['items'] = [
    {
      key: 'all',
      label: 'All Bookings',
      children: <AllBookingsTab tripId={tripId} onDataLoaded={handleDataLoaded} />
    },
    {
      key: 'onboarded',
      label: 'On Boarded',
      children: <OnBoardedTab tripId={tripId} />
    },
    {
      key: 'notboarded',
      label: 'Not Boarded',
      children: <NotBoardedTab tripId={tripId} />
    }
  ];

  return (
    <Tabs 
      defaultActiveKey="all" 
      className={styles.tabs}
      items={items}
    />
  );
}
