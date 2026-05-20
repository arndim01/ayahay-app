import { IWebhook } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import { WEBHOOK_TYPE } from '@ayahay/constants';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React from 'react';

interface WebhooksSummaryProps {
  webhooks?: IWebhook[];
  onDeleteWebhook: (webhookId: number) => Promise<void>;
}

export default function WebhooksSummary({
  webhooks,
  onDeleteWebhook,
}: WebhooksSummaryProps) {
  const webhookColumns: ColumnsType<IWebhook> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof WEBHOOK_TYPE) => WEBHOOK_TYPE[type],
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, { id }) => (
        <Popconfirm
          title='Deregister webhook'
          description='Are you sure to deregister this webhook?'
          onConfirm={() => onDeleteWebhook(id)}
        >
          <Button icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      columns={webhookColumns}
      dataSource={webhooks}
      pagination={false}
      loading={webhooks === undefined}
      tableLayout='fixed'
      rowKey={(webhook) => webhook.id}
    ></Table>
  );
}
