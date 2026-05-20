'use client';
import { useAuth } from '@/contexts/AuthContext';
import AccountSummary from '@ayahay/components/descriptions/AccountSummary';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/auth';
import { getShippingLine } from '@ayahay/services/shipping-line.service';
import {
  getMyApiKey,
  generateApiKey as _generateApiKey,
} from '@ayahay/services/account.service';
import { IAccount } from '@ayahay/models';
import { message } from 'antd';

export default function MyAccountPage() {
  useAuthGuard();
  const [account, setAccount] = useState<IAccount>();
  const [messageApi, contextHolder] = message.useMessage();
  const { loggedInAccount } = useAuth();

  const canViewApiKey =
    loggedInAccount?.role === 'ShippingLineAdmin' ||
    loggedInAccount?.role === 'TravelAgencyAdmin' ||
    loggedInAccount?.role === 'SuperAdmin';

  useEffect(() => {
    if (!loggedInAccount) {
      return;
    }

    console.log('fetching account information', loggedInAccount);

    fetchAccountInformation();
  }, [loggedInAccount]);

  const fetchAccountInformation = async () => {
    if (!loggedInAccount) {
      return;
    }

    loggedInAccount.apiKey = await getMyApiKey();

    if (loggedInAccount.shippingLineId) {
      loggedInAccount.shippingLine = await getShippingLine(
        loggedInAccount.shippingLineId
      );
    }

    setAccount(loggedInAccount);
  };

  const copyApiKeyToClipboard = async () => {
    if (!account?.apiKey) {
      return;
    }

    await navigator.clipboard.writeText(account.apiKey);
    messageApi.success('Copied to clipboard');
  };

  const generateApiKey = async () => {
    if (!account) {
      return;
    }

    try {
      const _account = { ...account, apiKey: await _generateApiKey() };
      setAccount(_account);
      messageApi.success('Successfully generated a new API key');
    } catch {
      messageApi.error(
        'Could not generate a new API key. Please contact support'
      );
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <AccountSummary
        account={account}
        canViewApiKey={canViewApiKey}
        onGenerateApiKey={generateApiKey}
        onCopyApiKey={copyApiKeyToClipboard}
      />
      {contextHolder}
    </div>
  );
}
