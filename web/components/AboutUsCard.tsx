'use client';
import React from 'react';
import styles from './AboutUsCard.module.scss';
import { Col, Row } from 'antd';
import {
  CheckCircleOutlined,
  FieldTimeOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

export default function AboutUsCard() {
  return (
    <div className={styles.containerFluid}>
      <h2>Why Choose Us</h2>
      <p>
        Ayahay serves as a platform that caters to the needs of both shipping
        lines and passengers/shippers in the Philippines. It acts as a bridge
        between shipping lines and passengers/shippers, providing a centralized
        platform for efficient communication and transactions.
      </p>
      <Row className={styles.rowCard} gutter={[32, 64]}>
        <Col xs={24} lg={8} className={styles.card}>
          <CheckCircleOutlined className={styles.icon} />
          <h3 className={styles.title}>Best Price Guarantee</h3>
        </Col>
        <Col xs={24} lg={8} className={styles.card}>
          <FieldTimeOutlined className={styles.icon} />
          <h3 className={styles.title}>Easy & Quick Booking</h3>
        </Col>
        <Col xs={24} lg={8} className={styles.card}>
          <PhoneOutlined className={styles.icon} />
          <h3 className={styles.title}>Customer Care 24/7</h3>
        </Col>
      </Row>
    </div>
  );
}
