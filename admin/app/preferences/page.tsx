'use client';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import styles from './page.module.scss';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import type { PreferencesTabItems } from './types';
import { useSearchParams, useRouter } from 'next/navigation';
import GeneralSettingsTab from './components/GeneralSettingsTab';

// Dynamically import tab components
const PassengerInformationTab = dynamic(
  () => import('./components/PassengerInformationTab'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

const ShippingLineBookingCutoff = dynamic(
  () => import('./components/ShippingLineBookingCutoff'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

const TermsAndConditions = dynamic(
  () => import('./components/TermsAndConditions'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

const UIBookingSettingsTab = dynamic(
  () => import('./components/UIBookingSettingsTab'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

const ReceiptSettingsTab = dynamic(
  () => import('./components/ReceiptSettingsTab'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

export default function PreferencesPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isShippingLineAdmin, setIsShippingLineAdmin] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const loginUser = JSON.parse(localStorage.getItem('logged-in-account')!);
    const userRole = loginUser?.data?.role;
    setIsSuperAdmin(userRole === 'SuperAdmin');
    setIsShippingLineAdmin(userRole === 'ShippingLineAdmin');
  }, []);

  // Get defaultActiveKey based on role and URL params
  const getDefaultActiveKey = () => {
    const tab = searchParams.get('tab');
    if (tab) {
      return tab;
    }
    return isSuperAdmin ? 'booking_cut_off' : 'passenger_information';
  };

  const handleTabChange = (key: string) => {
    router.push(`/preferences?tab=${key}`);
  };

  const TAB_ITEMS: PreferencesTabItems = [
    {
      key: 'general',
      label: 'General Settings',
      disabled: false, // Changed from true to false
      children: <GeneralSettingsTab />,
    },
    {
      key: 'passenger_information',
      label: 'Passenger Information',
      disabled: false,
      children: <PassengerInformationTab />,
    },
    {
      key: 'ui_booking_settings',
      label: 'UI Booking Settings',
      disabled: false,
      children: <UIBookingSettingsTab />,
    },
    {
      key: 'receipt_settings',
      label: 'Receipt Settings',
      disabled: false,
      children: <ReceiptSettingsTab />,
    },
    // Only include the shipping line booking cut-off tab for SuperAdmin
    ...(isSuperAdmin
      ? [
          {
            key: 'booking_cut_off',
            label: 'Shipping Line Booking Cut-off',
            children: <ShippingLineBookingCutoff />,
          },
          {
            key: 'terms_and_conditions',
            label: 'Terms and Conditions',
            children: <TermsAndConditions />,
          },
        ]
      : []),
      // Only include the terms and conditions tab for ShippingLineAdmin
      ...(isShippingLineAdmin
        ? [
            {
              key: 'terms_and_conditions',
              label: 'Terms and Conditions',
              children: <TermsAndConditions />,
            },
          ]
        : []),
  ];

  return (
    <div className={styles.preferencesPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Form Preferences</h1>
      </div>
      <Tabs
        activeKey={getDefaultActiveKey()}
        items={TAB_ITEMS}
        className={styles.tabs}
        onChange={handleTabChange}
        tabBarStyle={{ paddingLeft: '16px' }} // Add left padding to tab bar
      />
    </div>
  );
}
