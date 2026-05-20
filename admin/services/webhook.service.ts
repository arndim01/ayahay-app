import { FormInstance } from 'antd';
import { IAccount, IWebhook } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import { WEBHOOKS_API } from '@ayahay/constants';

export function buildWebhookFromCreateWebhookForm(
  form: FormInstance,
  { shippingLineId, travelAgencyId }: IAccount
): IWebhook {
  return {
    id: 0,
    shippingLineId,
    travelAgencyId,
    type: form.getFieldValue('type'),
    url: form.getFieldValue('url'),
  };
}

export async function getWebhooks(
  shippingLineId?: number,
  travelAgencyId?: number
): Promise<IWebhook[] | undefined> {
  const query = new URLSearchParams({
    shippingLineId,
    travelAgencyId,
  } as any).toString();

  try {
    const { data: webhooks } = await axios.get<IWebhook[]>(
      `${WEBHOOKS_API}?${query}`
    );

    return webhooks;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function registerWebhook(webhook: IWebhook): Promise<void> {
  return axios.post(`${WEBHOOKS_API}`, webhook);
}

export async function deregisterWebhook(webhookId: number): Promise<void> {
  return axios.delete(`${WEBHOOKS_API}/${webhookId}`);
}
