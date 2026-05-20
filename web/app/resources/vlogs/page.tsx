'use client';
import { Typography } from 'antd';
import styles from './page.module.scss';
import { useShippingLineToRestrictAccess } from '@/hooks/shipping-line';

const { Title } = Typography;

export default function Vlogs() {
  useShippingLineToRestrictAccess('Resources');

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30, marginBottom: 5 }}>
        We've done survey in one of the ports in Cebu and this is what we've
        discovered
      </Title>
      <video
        autoPlay
        loop
        // src='https://drive.google.com/uc?id=1x-TlNO-APD33PeUIqNEXYEmh4wtFl3rH'
        controls
      >
        <source src='https://drive.google.com/uc?id=1x-TlNO-APD33PeUIqNEXYEmh4wtFl3rH' />
      </video>
    </div>
  );
}
