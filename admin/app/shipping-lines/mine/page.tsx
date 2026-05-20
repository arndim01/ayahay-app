'use client';
import { useAuthGuard } from '@/hooks/auth';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { IShippingLine, IWebhook } from '@ayahay/models';
import { getShippingLine } from '@ayahay/services/shipping-line.service';
import { App, Button, Skeleton, Typography } from 'antd';
import WebhooksSummary from '@ayahay/components/descriptions/WebhooksSummary';
import {
  getWebhooks,
  registerWebhook as _registerWebhook,
  deregisterWebhook as _deregisterWebhook,
} from '@/services/webhook.service';
import CreateWebhookModal from '@/components/modal/CreateWebhookModal';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
export default function MyShippingLinePage() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { notification } = App.useApp();
  const { loggedInAccount } = useAuth();
  const [shippingLine, setShippingLine] = useState<IShippingLine>();
  const [webhooks, setWebhooks] = useState<IWebhook[]>();
  const [createWebhookModalOpen, setCreateWebhookModalOpen] = useState(false);

  useEffect(() => {
    if (!loggedInAccount) {
      return;
    }

    fetchShippingLine();
    fetchWebhooks();
  }, [loggedInAccount]);

  const fetchShippingLine = async () => {
    if (!loggedInAccount?.shippingLineId) {
      setShippingLine(undefined);
      return;
    }

    setShippingLine(await getShippingLine(loggedInAccount.shippingLineId));
  };

  const fetchWebhooks = async (): Promise<void> => {
    const canViewWebhooks =
      loggedInAccount?.role === 'ShippingLineAdmin' ||
      loggedInAccount?.role === 'SuperAdmin';
    if (!canViewWebhooks) {
      setWebhooks([]);
      return;
    }
    const webhooks = await getWebhooks(
      loggedInAccount?.shippingLineId,
      undefined
    );
    setWebhooks(webhooks);
  };

  const registerWebhook = async (webhook: IWebhook): Promise<void> => {
    try {
      await _registerWebhook(webhook);
      setCreateWebhookModalOpen(false);
      await fetchWebhooks();
      notification.success({
        message: 'Registration Success',
        description: 'The webhook has been successfully registered',
      });
    } catch {
      notification.error({
        message: 'Registration Failed',
        description: 'Something went wrong',
      });
    }
  };

  const deregisterWebhook = async (webhookId: number): Promise<void> => {
    try {
      await _deregisterWebhook(webhookId);
      await fetchWebhooks();
      notification.success({
        message: 'Deregistration Success',
        description: 'The webhook has been successfully deregistered',
      });
    } catch {
      notification.error({
        message: 'Deregistration Failed',
        description: 'Something went wrong',
      });
    }
  };

  return (
    <Skeleton loading={shippingLine === undefined} style={{ margin: '32px' }}>
      {shippingLine && (
        <div style={{ margin: '32px' }}>
          <Title level={1}>{shippingLine.name}</Title>
          <Title level={2}>Webhooks</Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setCreateWebhookModalOpen(true)}
            style={{ marginBottom: '16px' }}
          >
            Register Webhook
          </Button>
          <WebhooksSummary
            webhooks={webhooks}
            onDeleteWebhook={deregisterWebhook}
          />
          <CreateWebhookModal
            open={createWebhookModalOpen}
            onCreateWebhook={registerWebhook}
            onCancel={() => setCreateWebhookModalOpen(false)}
            width={512}
          />
        </div>
      )}
    </Skeleton>
  );
}
