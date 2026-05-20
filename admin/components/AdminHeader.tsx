import React from 'react';
import Image from 'next/image';
import styles from './AdminHeader.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import { Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import Logout from './auth/Logout';
import { webLinks, accountLinks } from '@/services/nav.service';
import { useAuth } from '@/contexts/AuthContext';
import Notifications from '@ayahay/components/Notifications';

export default function AdminHeader() {
  const { loggedInAccount } = useAuth();
  const pathName = usePathname();
  const router = useRouter();

  const userRole = loggedInAccount && loggedInAccount.role;
  const headerTabs = webLinks[loggedInAccount?.role ?? ''] ?? [];
  const accountTabs = accountLinks[loggedInAccount?.role ?? ''] ?? [];

  return (
    <nav className={`hide-on-print ${styles['nav-container']}`}>
      <div className={styles['nav-main']}>
        <Image src={AyahayLogo} alt='Ayahay' height={48} />
        {loggedInAccount && userRole !== 'Passenger' && (
          <ul className={styles['nav-links']}>
            <Menu
              mode='horizontal'
              style={{ background: 'none', borderBottomStyle: 'none' }}
              defaultSelectedKeys={headerTabs
                .filter((link) => pathName === `/${link.key}`)
                .map((link) => link.key)}
              disabledOverflow={true}
              items={headerTabs}
              onClick={({ key }) => router.push(key)}
            />
          </ul>
        )}
      </div>

      {loggedInAccount && userRole !== 'Passenger' && (
        <div className={styles['nav-buttons']}>
          <Notifications
            hasAdminPrivileges={
              loggedInAccount.role === 'ShippingLineAdmin' ||
              loggedInAccount.role === 'SuperAdmin'
            }
          />
          <Logout roleSpecificMenuItems={accountTabs} />
        </div>
      )}
    </nav>
  );
}
