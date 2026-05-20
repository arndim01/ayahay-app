import { ACCOUNT_API } from '@ayahay/constants';
import { IAccount } from '@ayahay/models';
import axios from '@ayahay/services/axios';

export async function getAccount(
  accountId: string
): Promise<IAccount | undefined> {
  try {
    const { data: account } = await axios.get(`${ACCOUNT_API}/${accountId}`);
    return account;
  } catch (e) {
    console.error(e);
  }
}

export async function updateAccount(data: any): Promise<void> {
  try {
    await axios.patch(ACCOUNT_API, data);
  } catch (e) {
    console.error(e);
  }
}

export async function unsubscribeEmail(): Promise<void> {
  try {
    await axios.post(`${ACCOUNT_API}/unsubscribe`);
  } catch (e) {
    console.error(e);
  }
}