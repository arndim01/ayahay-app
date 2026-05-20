import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

export const UserIcon = React.memo(() => <UserOutlined />);
export const SettingsIcon = React.memo(() => <SettingOutlined />);
export const PreferencesTitle = React.memo(() => (
  <Title level={2}>Form Preferences</Title>
));
