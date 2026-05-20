'use client';
import { useAuthGuard } from '@/hooks/auth';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { ITravelAgency, IWebhook } from '@ayahay/models';
import { getTravelAgency } from '@ayahay/services/travel-agency.service';
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
export default function MyTravelAgencyPage() {
  useAuthGuard(['TravelAgencyStaff', 'TravelAgencyAdmin', 'SuperAdmin']);
  const { notification } = App.useApp();
  const { loggedInAccount } = useAuth();
  const [travelAgency, setTravelAgency] = useState<ITravelAgency>();
  const [webhooks, setWebhooks] = useState<IWebhook[]>();
  const [createWebhookModalOpen, setCreateWebhookModalOpen] = useState(false);

  useEffect(() => {
    if (!loggedInAccount) {
      return;
    }

    fetchTravelAgency();
    fetchWebhooks();
  }, [loggedInAccount]);

  const fetchTravelAgency = async () => {
    if (!loggedInAccount?.travelAgencyId) {
      setTravelAgency(undefined);
      return;
    }

    setTravelAgency(await getTravelAgency(loggedInAccount.travelAgencyId));
  };

  const fetchWebhooks = async (): Promise<void> => {
    const canViewWebhooks =
      loggedInAccount?.role === 'TravelAgencyAdmin' ||
      loggedInAccount?.role === 'SuperAdmin';
    if (!canViewWebhooks) {
      setWebhooks([]);
      return;
    }
    const webhooks = await getWebhooks(
      undefined,
      loggedInAccount?.travelAgencyId
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
    <Skeleton loading={travelAgency === undefined} style={{ margin: '32px' }}>
      {travelAgency && (
        <div style={{ margin: '32px' }}>
          <Title level={1}>{travelAgency.name}</Title>
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
