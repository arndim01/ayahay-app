import styles from './Notifications.module.scss';
import { INotification } from '@ayahay/models';
import React, { useState, useEffect } from 'react';
import {
  getMyNotifications,
  createAnnouncement,
} from '../services/notification.service';
import {
  Button,
  Empty,
  Form,
  Input,
  Modal,
  notification,
  Popover,
  Typography,
} from 'antd';
import { BellOutlined, PlusOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { PaginatedRequest } from '@ayahay/http';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title } = Typography;

interface NotificationsProps {
  hasAdminPrivileges?: boolean;
}

const recordsToFetch = 5;

export default function Notifications({
  hasAdminPrivileges,
}: NotificationsProps) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    const loadedNotifications = await fetchNotifications({ page: 1 });
    setNotifications(loadedNotifications);
  };

  const fetchNotifications = async (
    pagination: PaginatedRequest
  ): Promise<INotification[]> => {
    const loadedNotifications = (await getMyNotifications(pagination)) ?? [];

    if (loadedNotifications.length < recordsToFetch) {
      setHasMoreNotifications(false);
    }

    return loadedNotifications;
  };

  const loadMoreNotifications = async () => {
    const nextPage = page + 1;
    const loadedNotifications = await fetchNotifications({ page: nextPage });

    setPage(nextPage);
    setNotifications([...notifications, ...loadedNotifications]);
  };

  const onCreateAnnouncement = async (values: any): Promise<void> => {
    setLoading(true);

    try {
      await createAnnouncement(values);
      api.success({
        message: 'Create Announcement Success',
        description: 'The announcement has been created successfully.',
      });
      setIsModalOpen(false);
    } catch (e) {
      api.error({
        message: 'Create Announcement Failed',
        description: 'Something went wrong. The announcement was not created.',
      });
    }
    setLoading(false);
  };

  const createAnnouncementModal = (
    <Modal
      title='Send an Announcement'
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
    >
      <Form
        form={form}
        onFinish={onCreateAnnouncement}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          label='Subject'
          name='subject'
          rules={[
            {
              required: true,
              message: 'Please input an announcement subject',
            },
          ]}
        >
          <Input placeholder='Announcement Subject' />
        </Form.Item>
        <Form.Item
          label='Message'
          name='body'
          rules={[
            {
              required: true,
              message: 'Please input an announcement message',
            },
          ]}
        >
          <TextArea
            placeholder='Announcement message...'
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>
        <Form.Item>
          <Button key='back' onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button type='primary' htmlType='submit' loading={loading}>
            Send
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  const onOpenSendAnnouncementModal = () => {
    form.resetFields();
    setIsModalOpen(true);
    setIsPopoverOpen(false);
  };

  const notificationsPopover = (
    <div id={styles['notifications-popover']}>
      <section className={styles['header']}>
        <Title level={2}>Notifications</Title>
        {hasAdminPrivileges && (
          <Button
            type='primary'
            shape='circle'
            icon={<PlusOutlined />}
            onClick={() => onOpenSendAnnouncementModal()}
          ></Button>
        )}
      </section>
      <section id={styles['notification-list']}>
        {notifications.length === 0 && (
          <Empty description='No notifications to show'></Empty>
        )}
        {notifications.map((notification) => (
          <article key={notification.id}>
            <Title level={3}>{notification.subject}</Title>
            <p>{notification.body}</p>
            <strong>{dayjs(notification.dateCreatedIso).fromNow()}</strong>
          </article>
        ))}
      </section>
      {hasMoreNotifications && (
        <Button
          onClick={() => loadMoreNotifications()}
          block
          type='dashed'
          style={{ marginTop: '16px' }}
        >
          Load more notifications
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Popover
        content={notificationsPopover}
        trigger='click'
        open={isPopoverOpen}
        onOpenChange={(isOpen) => setIsPopoverOpen(isOpen)}
      >
        <Button type='text'>
          <BellOutlined />
        </Button>
      </Popover>
      {hasAdminPrivileges && createAnnouncementModal}
      {contextHolder}
    </>
  );
}
