import { Button, Descriptions, Flex, Popconfirm, Skeleton } from 'antd';
import { IAccount } from '@ayahay/models';
import React from 'react';
import { CopyOutlined, SyncOutlined } from '@ant-design/icons';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';

interface AccountSummaryProps {
  account: IAccount | undefined | null;
  canViewApiKey: boolean;
  onGenerateApiKey: () => Promise<void>;
  onCopyApiKey: () => Promise<void>;
}

export default function AccountSummary({
  account,
  canViewApiKey,
  onGenerateApiKey,
  onCopyApiKey,
}: AccountSummaryProps) {
  const screens = useBreakpoint();

  return (
    <Skeleton loading={!account} active>
      {account && (
        <Descriptions
          bordered={screens.sm}
          column={{ xxl: 1, xl: 1, lg: 2, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label='Email'>{account.email}</Descriptions.Item>
          {account.shippingLine && (
            <Descriptions.Item label='Shipping Line'>
              {account.shippingLine.name}
            </Descriptions.Item>
          )}
          {account.travelAgency && (
            <Descriptions.Item label='Travel Agency'>
              {account.travelAgency.name}
            </Descriptions.Item>
          )}
          {canViewApiKey && (
            <Descriptions.Item label='API Key'>
              <Flex justify='space-between'>
                <span>{account.apiKey}</span>
                <Flex gap='small'>
                  {account.apiKey && (
                    <Button
                      type='default'
                      icon={<CopyOutlined />}
                      onClick={() => onCopyApiKey()}
                    />
                  )}
                  <Popconfirm
                    title='Generate API key'
                    description='Your existing API key will be invalidated.'
                    onConfirm={() => onGenerateApiKey()}
                    okText='Yes'
                    cancelText='No'
                  >
                    <Button type='default' icon={<SyncOutlined />} />
                  </Popconfirm>
                </Flex>
              </Flex>
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
    </Skeleton>
  );
}
