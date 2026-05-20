'use client';
import React from 'react';
import { Button, DatePicker, Flex, Form } from 'antd';
import PortAutoComplete from '@ayahay/components/form/PortAutoComplete';
import styles from './TripSearchQuery.module.scss';
import dayjs from 'dayjs';
import EnumRadio from '@ayahay/components/form/EnumRadio';
import { BOOKING_TYPE } from '@ayahay/constants/enum';
import PassengerAndVehicleCount from '../form/PassengerAndVehicleCount';

export default function TripSearchQuery({
  ...htmlAttributes
}: React.HTMLAttributes<HTMLElement>) {
  const form = Form.useFormInstance();
  const bookingType = Form.useWatch('bookingType', form);
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  return (
    <article
      className={`${styles['trip-search-query']} ${htmlAttributes.className}`}
    >
      <div className={styles['search-container']}>
        <div className={styles['search-type']}>
          <EnumRadio _enum={BOOKING_TYPE} name='bookingType' disabled={false} />
        </div>

        <article className={styles['search-main']}>
          <div className={styles['search-input-wrapper']}>
            <label>Origin Port</label>
            <PortAutoComplete
              excludePortId={destPortId}
              labelCol={{ span: 24 }}
              colon={false}
              name='srcPortId'
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className={styles['search-input-wrapper']}>
            <label>Destination Port</label>
            <PortAutoComplete
              excludePortId={srcPortId}
              labelCol={{ span: 24 }}
              colon={false}
              name='destPortId'
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className={styles['search-input-wrapper']}>
            <label>Departure Date</label>
            <Form.Item
              labelCol={{ span: 24 }}
              colon={false}
              name='departureDate'
              style={{ marginBottom: 0, maxWidth: '128px' }}
            >
              <DatePicker
                className={styles['ant-picker-input']}
                disabledDate={(current) => current < dayjs().startOf('day')}
                format='MMM D, YYYY'
                allowClear={false}
                variant='borderless'
                size='large'
              />
            </Form.Item>
          </div>
          {bookingType === 'Round' && (
            <div className={styles['search-input-wrapper']}>
              <label>Return Date</label>
              <Form.Item
                labelCol={{ span: 24 }}
                colon={false}
                name='returnDate'
                style={{ marginBottom: 0, maxWidth: '128px' }}
              >
                <DatePicker
                  className={styles['ant-picker-input']}
                  format='MMM D, YYYY'
                  allowClear={false}
                  variant='borderless'
                  size='large'
                />
              </Form.Item>
            </div>
          )}
          <div
            className={styles['search-input-wrapper']}
            style={{ borderRight: 0, fontSize: '16px' }}
          >
            <PassengerAndVehicleCount />
          </div>
          <Form.Item style={{ marginBottom: 0, padding: '10px 20px' }}>
            <Button type='primary' htmlType='submit' block>
              Submit
            </Button>
          </Form.Item>
        </article>
      </div>
    </article>
  );
}
