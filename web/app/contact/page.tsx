'use client';
import { Button, Form, Input, Space, Typography } from 'antd';
import styles from './page.module.scss';
import { useState } from 'react';
import {
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  MailOutlined,
  PhoneOutlined,
  TwitterSquareFilled,
} from '@ant-design/icons';
import { useShippingLineToRestrictAccess } from '@/hooks/shipping-line';

const { Title } = Typography;
const { TextArea } = Input;

export default function Contact() {
  useShippingLineToRestrictAccess('Contact');
  const [emailBody, setEmailBody] = useState('');
  const [emailName, setEmailName] = useState('');

  const onFinish = (values: any) => {
    const { name, email, message } = values;
    //TO DO: send email
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30, marginBottom: 5 }}>
        Contact us
      </Title>
      <p>Want to get in touch? Send us a message and we'll get back to you.</p>
      <Form name='contact_form' onFinish={onFinish} style={{ maxWidth: 600 }}>
        <div className={styles['name-email']}>
          <Form.Item
            name='name'
            className={styles['name']}
            rules={[{ required: true, message: 'Please input your name' }]}
          >
            <Input
              value={emailName}
              onChange={(e) => setEmailName(e.target.value)}
              placeholder='Name'
            />
          </Form.Item>
          <Form.Item
            name='email'
            className={styles['email']}
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              { required: true, message: 'Please input your email' },
            ]}
          >
            <Input placeholder='Email' />
          </Form.Item>
        </div>
        <Form.Item
          name='message'
          rules={[{ required: true, message: 'Please input an email message' }]}
        >
          <TextArea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder='Type your message here'
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            href={`mailto:admin@ayahay.com?subject=${emailName} Ayahay Inquiry&body=${emailBody}`}
          >
            Send
          </Button>
        </Form.Item>
      </Form>
      <Title
        level={2}
        style={{ fontSize: 20, marginBottom: 10, marginTop: 10 }}
      >
        You may also directly reach out to us via:
      </Title>
      <div className={styles['contact']}>
        <PhoneOutlined /> Phone: (032) 517 4255
      </div>
      <div className={styles['contact']}>
        <MailOutlined /> Email: admin@ayahay.com
      </div>
      <Title
        level={2}
        style={{ fontSize: 20, marginBottom: 10, marginTop: 10 }}
      >
        Follow us on social media to keep up to date:
      </Title>
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
        <a
          href='https://www.tiktok.com/@ayahaytiktok'
          style={{ fontSize: 25 }}
          target='_blank'
        >
          Tiktok
        </a>
      </Space>
    </div>
  );
}
