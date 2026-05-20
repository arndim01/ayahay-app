'use client';
import React, { useEffect, useState } from 'react';
import { Card, Switch, Typography, Space, Badge } from 'antd';
import { CompassOutlined } from '@ant-design/icons';
import styles from './GeneralSettingsTab.module.scss';
import { useFeature } from '@/contexts/FeatureContext';
import { setCookie, getCookie, VOYAGE_FEATURE_COOKIE } from '@/utils/cookies';

const { Title, Text } = Typography;
const COOKIE_EXPIRY_DAYS = 365;

const GeneralSettingsTab: React.FC = () => {
  const { voyageEnabled, setVoyageEnabled } = useFeature();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedState = getCookie(VOYAGE_FEATURE_COOKIE);
    if (savedState !== null) {
      setVoyageEnabled(savedState === 'true');
    } else {
      setVoyageEnabled(false);
      setCookie(VOYAGE_FEATURE_COOKIE, 'false', COOKIE_EXPIRY_DAYS);
    }
    setMounted(true);
  }, []);

  const handleToggle = (checked: boolean) => {
    setVoyageEnabled(checked);
    setCookie(VOYAGE_FEATURE_COOKIE, checked.toString(), COOKIE_EXPIRY_DAYS);
  };

  if (!mounted) {
    return null; // Prevent flash of incorrect content
  }

  return (
    <div className={styles.settingsContainer}>
      <Card 
        bordered={false} 
        className={styles.featureCard}
        title={
          <Space align="center">
            <Badge status={voyageEnabled ? "success" : "default"} />
            <Text strong>Sailing History: Total Voyages</Text>
          </Space>
        }
      >
        <div className={styles.featureBox}>
          <div className={styles.iconWrapper}>
            <CompassOutlined className={`${styles.featureIcon} ${voyageEnabled ? styles.iconEnabled : ''}`} />
          </div>
          <div className={styles.featureContent}>
            <div className={styles.featureHeader}>
              <Title level={5}>Voyage Tracking</Title>
              <Switch
                checked={voyageEnabled}
                onChange={handleToggle}
                className={`${styles.switch} ${voyageEnabled ? styles.switchEnabled : styles.switchDisabled}`}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>
            <Text type="secondary" className={styles.description}>
              {voyageEnabled 
                ? "Voyage tracking is currently active. Trip list will display voyage numbers."
                : "Enable this feature to display voyage tracking numbers in your trip list."}
            </Text>
            <div className={styles.statusIndicator}>
              <Badge 
                status={voyageEnabled ? "success" : "default"} 
                text={
                  <Text className={voyageEnabled ? styles.activeText : styles.inactiveText}>
                    {voyageEnabled ? "Feature is currently active" : "Feature is currently disabled"}
                  </Text>
                } 
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GeneralSettingsTab;
