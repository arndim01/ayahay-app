import { Form, Input, Modal, ModalProps, Typography } from 'antd';
import React from 'react';
import EnumRadio from '@ayahay/components/form/EnumRadio';
import { WEBHOOK_TYPE } from '@ayahay/constants';
import { IWebhook } from '@ayahay/models';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { buildWebhookFromCreateWebhookForm } from '@/services/webhook.service';

const { Title } = Typography;

interface CreateWebhookModalProps {
  onCreateWebhook: (webhook: IWebhook) => Promise<void>;
}

export default function CreateWebhookModal({
  onCreateWebhook,
  onOk,
  ...modalProps
}: CreateWebhookModalProps & ModalProps) {
  const [form] = Form.useForm();
  const { loggedInAccount } = useAuth();

  const onOkModal = async () => {
    if (!loggedInAccount) {
      return;
    }

    try {
      await form.validateFields();
      const webhook = buildWebhookFromCreateWebhookForm(form, loggedInAccount);
      await onCreateWebhook(webhook);
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Confirm' closeIcon={true} {...modalProps}>
      <Title level={2}>Register Webhook</Title>
      <Form form={form}>
        <EnumRadio
          _enum={WEBHOOK_TYPE}
          label='Type'
          name='type'
          colon={false}
          rules={[
            { required: true, message: 'Please select the webhook type' },
          ]}
        />
        <Form.Item
          label='URL'
          name='url'
          colon={false}
          rules={[
            { required: true, message: 'Please input the webhook URL' },
            { type: 'url', message: 'Please input a valid URL' },
          ]}
          tooltip={{
            title:
              'Our API will call this URL when an event corresponding to the Type field occurs',
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input type='url' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
