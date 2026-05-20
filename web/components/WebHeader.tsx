'use client';
import React from 'react';
import styles from './WebHeader.module.scss';
import { Menu } from 'antd';
import Notifications from '@ayahay/components/Notifications';
import { onlineLinks, whiteLabelLinks } from '@/services/nav.service';
import AuthForm from '@/components/auth/AuthForm';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useShippingLineForWhiteLabel } from '@/hooks/shipping-line';

export default function WebHeader() {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;
  const { loggedInAccount } = useAuth();
  const pathName = usePathname();
  const router = useRouter();
  const shippingLine = useShippingLineForWhiteLabel();

  const selectedTab = (links: any[]) => {
    return links
      .filter((link) => pathName === `/${link.key}`)
      .map((link) => link.key);
  };

  return (
    <nav className={`hide-on-print ${styles['nav-container']}`}>
      <div className={styles['nav-main']}>
        <img
          src={
            shippingLine
              ? `${SHIPPING_LINE_LOGO}${shippingLine?.logoFilename}`
              : '/assets/ayahay-logo.png'
          }
          alt='Ayahay'
          height={48}
        />
        <ul className={styles['nav-links']}>
          <Menu
            mode='horizontal'
            style={{ background: 'none', borderBottomStyle: 'none' }}
            defaultSelectedKeys={
              shippingLine
                ? selectedTab(whiteLabelLinks)
                : selectedTab(onlineLinks)
            }
            disabledOverflow={true}
            items={shippingLine ? whiteLabelLinks : onlineLinks}
            onClick={({ key }) => router.push(key)}
          />
        </ul>
      </div>

      <div className={styles['nav-buttons']}>
        <Notifications
          hasAdminPrivileges={
            loggedInAccount?.role === 'ShippingLineAdmin' ||
            loggedInAccount?.role === 'SuperAdmin'
          }
        />
        <AuthForm />
      </div>
    </nav>
  );
}
