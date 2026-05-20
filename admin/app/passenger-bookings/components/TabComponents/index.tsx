'use client';
import { Tabs, TabsProps } from 'antd';
import AllBookingsTab from './AllBookingsTab';
// Fix the imports - import the correct components
import OnBoardedTab from './OnBoardedTab';  // Changed from './NotBoardedTab'
import NotBoardedTab from './NotBoardedTab';
import styles from './tabs.module.scss';

interface BookingTabsProps {
  tripId: string;
}

export default function BookingTabs({ tripId }: BookingTabsProps) {
  const items: TabsProps['items'] = [
    {
      key: 'all',
      label: 'All Bookings',
      children: <AllBookingsTab tripId={tripId} />
    },
    {
      key: 'onboarded',
      label: 'On Boarded',
      children: <OnBoardedTab tripId={tripId} />  // Now correctly uses OnBoardedTab
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
