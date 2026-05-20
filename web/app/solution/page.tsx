'use client';
import { Typography } from 'antd';
import styles from './page.module.scss';
import { useShippingLineToRestrictAccess } from '@/hooks/shipping-line';

const { Title } = Typography;

export default function Solution() {
  useShippingLineToRestrictAccess('Solution');

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30 }}>
        Solution for Passengers & Shippers
      </Title>
      <p>Booking Platform</p>
      <img
        className={styles['image']}
        alt='booking'
        src='/assets/booking-platform.png'
      />
      <Title level={1} style={{ fontSize: 30, paddingTop: 15 }}>
        Solution for Ocean Liners
      </Title>
      <p>Data Dashboard</p>
      <img
        className={styles['image']}
        alt='dashboard'
        src='/assets/data-dashboard.png'
      />
    </div>
  );
}
