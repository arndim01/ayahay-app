import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { IVoucher, IVoyage } from '@ayahay/models';
import { VOUCHERS_API } from '@ayahay/constants';
import axios from '@ayahay/services/axios';
import { FormInstance } from 'antd';

export async function getVouchers(
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IVoucher> | undefined> {
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data: vouchers } = await axios.get<PaginatedResponse<IVoucher>>(
      `${VOUCHERS_API}?${query}`
    );

    return vouchers;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function createVoucher(voucher: IVoucher): Promise<void> {
  return axios.post(`${VOUCHERS_API}`, voucher);
}

export function buildVoucherFromCreateVoucherForm(
  form: FormInstance
): IVoucher {
  return {
    code: form.getFieldValue('code'),
    // API will ignore this field
    createdByAccountId: '',

    description: form.getFieldValue('description'),
    discountFlat: form.getFieldValue('discountFlat'),
    discountPercent: form.getFieldValue('discountPercent') / 100.0,
    numberOfUses: form.getFieldValue('numberOfUses'),
    expiryIso: form.getFieldValue('expiry').toISOString(),
    canBookOnline: form.getFieldValue('canBookOnline'),
  };
}
