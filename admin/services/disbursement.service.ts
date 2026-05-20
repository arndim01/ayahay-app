import { DISBURSEMENT_API } from '@ayahay/constants';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { IDisbursement } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import { FormInstance } from 'antd';
import dayjs from 'dayjs';

export async function getDisbursementsByTrip(
  tripId: number,
  pagination?: PaginatedRequest
): Promise<PaginatedResponse<IDisbursement>> {
  const query = new URLSearchParams({
    tripId,
    ...pagination,
  } as any).toString();

  const { data } = await axios.get(`${DISBURSEMENT_API}?${query}`);
  return data;
}

export async function createDisbursements(disbursements: any[]): Promise<void> {
  try {
    await axios.post(DISBURSEMENT_API, disbursements);
  } catch (e) {
    console.error(e);
    throw Error();
  }
}

export async function updateDisbursement(
  disbursementId: number,
  disbursement: any
): Promise<void> {
  try {
    await axios.patch(`${DISBURSEMENT_API}/${disbursementId}`, disbursement);
  } catch (e) {
    console.error(e);
    throw Error();
  }
}

export async function deleteDisbursement(disbursementId: number): Promise<void> {
  try {
    await axios.delete(`${DISBURSEMENT_API}/${disbursementId}`);
  } catch (e) {
    console.error(e);
    throw Error();
  }
}

export function buildDisburementFromDisburmentForm(
  form: FormInstance,
  tripId: number
): any[] {
  return form.getFieldsValue().disbursement.map((d: any) => ({
    ...d,
    tripId: Number(tripId),
    date: dayjs(d.date).startOf('day').toISOString(),
  }));
}
