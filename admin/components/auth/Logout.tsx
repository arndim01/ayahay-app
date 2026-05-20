'use client';
import React, { useState } from 'react';
import { Avatar, Button, Dropdown, MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LogoutProps {
  roleSpecificMenuItems: { label: string; href: string }[];
}

export default function Logout({ roleSpecificMenuItems }: LogoutProps) {
  const { currentUser, loggedInAccount, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const logOut = () => {
    router.push('/');
    logout();
    setDropdownOpen(false);
    
  };

  const items: MenuProps['items'] = [
    {
      key: '/accounts/mine',
      label: <Link href='/accounts/mine'>My Account</Link>,
    },
    ...roleSpecificMenuItems.map((menuItem) => ({
      key: menuItem.href,
      label: <Link href={menuItem.href}>{menuItem.label}</Link>,
    })),
    // Only show Preference menu item for SuperAdmin role
    ...(loggedInAccount?.role === 'SuperAdmin' ? [{
      key: '/preferences',
      label: <Link href='/preferences'>Preference</Link>,
    }] : []),
    {
      key: '1',
      label: (
        <button
          style={{ all: 'unset', width: '100%' }}
          onClick={() => logOut()}
        >
          Log Out
        </button>
      ),
    },
  ];

  const label = loggedInAccount
    ? `Welcome, ${
        loggedInAccount?.passenger?.firstName ??
        loggedInAccount?.email.split('@')[0]
      }`
    : '';
  return (
    <div>
      <Dropdown menu={{ items }} open={!!currentUser && dropdownOpen}>
        <Button
          type='text'
          size='large'
          style={{ height: 'auto' }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span style={{ marginRight: '12px', fontSize: '14px' }}>{label}</span>
          <Avatar icon={<UserOutlined />} />
        </Button>
      </Dropdown>
    </div>
  );
}
