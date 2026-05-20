'use client';
import Sider from 'antd/es/layout/Sider';
import { Menu } from 'antd';
import { onlineLinks, whiteLabelLinks } from '@/services/nav.service';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './WebSider.module.scss';
import { useShippingLineForWhiteLabel } from '@/hooks/shipping-line';

export default function WebSider() {
  const pathName = usePathname();
  const router = useRouter();
  const shippingLine = useShippingLineForWhiteLabel();

  const selectedTab = (links: any[]) => {
    return links
      .filter((link) => pathName === `/${link.key}`)
      .map((link) => link.key);
  };

  return (
    <Sider
      breakpoint='md'
      collapsedWidth='0'
      reverseArrow
      id={styles['web-sider']}
      className='hide-on-print'
    >
      <nav id={styles['web-sider-nav']}>
        <Menu
          theme='dark'
          mode='inline'
          defaultSelectedKeys={
            shippingLine
              ? selectedTab(whiteLabelLinks)
              : selectedTab(onlineLinks)
          }
          items={shippingLine ? whiteLabelLinks : onlineLinks}
          onClick={({ key }) => router.push(key)}
        />
      </nav>
    </Sider>
  );
}
