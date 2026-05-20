'use client';
import React from 'react';
import styles from './WebFooter.module.scss';
import {
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  TwitterSquareFilled,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import { Footer } from 'antd/es/layout/layout';

export default function WebFooter() {
  return (
    <Footer className='hide-on-print' id={styles['foot-base']}>
      <div className={styles['main-container']}>
        <div className={styles['left-sub-container']}>
          <div className={styles['left-col-card']}>
            <div className={styles['contact-card']}>
              <div className={styles['contact-call']}>
                <h1>Customer Care</h1>
                <h2>Smart/TNT: (+63) 909 968 2705</h2>
                <h2>Globe: (+63) 954 156 7116</h2>
              </div>
              <div className={styles['contact-email']}>
                <h1>Need support?</h1>
                <h2>
                  <a href={`mailto:admin@ayahay.com?subject=Need Support`}>
                    admin@ayahay.com
                  </a>
                </h2>
              </div>
            </div>
          </div>
          <h3>Follow us on social media</h3>
          <div className={styles['left-col-card']}>
            <Space>
              <a
                href='https://www.facebook.com/profile.php?id=61551614079847&is_tour_dismissed=true'
                target='_blank'
              >
                <FacebookFilled style={{ fontSize: 28 }} />
              </a>
              <a href='https://www.instagram.com/ayahayig' target='_blank'>
                <InstagramFilled style={{ fontSize: 28 }} />
              </a>
              <a href='https://twitter.com/ayahayX' target='_blank'>
                <TwitterSquareFilled style={{ fontSize: 28 }} />
              </a>
              <a
                href='https://www.linkedin.com/company/ayahay-technologies-corporation/about/?viewAsMember=true'
                target='_blank'
              >
                <LinkedinFilled style={{ fontSize: 28 }} />
              </a>
            </Space>
          </div>
        </div>
        <div className={styles['right-sub-container']}>
          <h1>Get Updates & More</h1>
          <div className={styles['right-col-card']}>
            <div className={styles['email-input']}>
              <input
                type='email'
                title='email'
                placeholder='Your Email'
              ></input>
              <Button
                type='text'
                htmlType='submit'
                href={`mailto:admin@ayahay.com?subject=Ayahay Inquiry`}
                className={styles['send-button']}
              >
                Send
              </Button>
            </div>
          </div>
          <div className={styles['right-col-card']}>
            <div className={styles['nav-container']}>
              <div className={styles['nav-card']}>
                <h2>Company</h2>
                <ul>
                  <li>
                    <a href='#'>About Us</a>
                  </li>
                  <li>
                    <a href='#'>Careers</a>
                  </li>
                  <li>
                    <a href='#'>Press</a>
                  </li>
                </ul>
              </div>
              <div className={styles['nav-card']}>
                <h2>Support</h2>
                <ul>
                  <li>
                    <a href='#'>Customer Care</a>
                  </li>
                  <li>
                    <a href='#'>Contact</a>
                  </li>
                  <li>
                    <a href='/frequently-asked-questions'>
                      Frequently Asked Questions
                    </a>
                  </li>
                </ul>
              </div>
              <div className={styles['nav-card']}>
                <h2>Legal Docs</h2>
                <ul>
                  <li>
                    <a href='/online-booking-conditions'>
                      Online Booking Conditions
                    </a>
                  </li>
                  <li>
                    <a href='/privacy-policy'>Privacy Policy</a>
                  </li>
                  <li>
                    <a href='/terms-of-use'>Terms of Use</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className={styles['bot-sub-container']}>
          <span>© 2023 Ayahay All rights reserved.</span>
        </div>
      </div>
    </Footer>
  );
}
