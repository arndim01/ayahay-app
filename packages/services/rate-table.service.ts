import { cacheItem, fetchItem } from './cache.service';
import axios from './axios';
import { IRateTable, IRateTableMarkup } from '@ayahay/models';
import { RATE_TABLES_API } from '@ayahay/constants';
import { FormInstance } from 'antd';

export async function getRateTableById(
  rateTableId: number
): Promise<IRateTable | undefined> {
  const cachedRateTables =
    fetchItem<{ [rateTableId: number]: IRateTable }>('rate-tables-by-id') ?? {};

  if (cachedRateTables[rateTableId]) {
    return cachedRateTables[rateTableId];
  }

  try {
    const { data: rateTable } = await axios.get<IRateTable>(
      `${RATE_TABLES_API}/${rateTableId}`
    );
    cachedRateTables[rateTableId] = rateTable;
    cacheItem('rate-tables-by-id', cachedRateTables, 60);
    return rateTable;
  } catch (e) {
    console.error(e);
  }
  return undefined;
}

export async function getRateTables(): Promise<IRateTable[] | undefined> {
  try {
    const { data: rateTables } = await axios.get<IRateTable[]>(RATE_TABLES_API);
    return rateTables;
  } catch (e) {
    console.error(e);
  }

  return undefined;
}

export async function getFullRateTableById(
  id: number
): Promise<IRateTable | undefined> {
  try {
    const { data: rateTable } = await axios.get<IRateTable>(
      `${RATE_TABLES_API}/${id}/full`
    );
    return rateTable;
  } catch (e) {
    console.error(e);
  }

  return undefined;
}

export function buildRateTableMarkupFromForm(
  form: FormInstance
): IRateTableMarkup {
  return {
    id: form.getFieldValue('id'),
    rateTableId: form.getFieldValue('rateTableId'),
    travelAgencyId: form.getFieldValue('travelAgencyId'),
    clientId: form.getFieldValue('clientId'),

    markupFlat: form.getFieldValue('markupFlat'),
    markupPercent: form.getFieldValue('markupPercent') / 100.0,
    markupMaxFlat: form.getFieldValue('markupMaxFlat'),
    commission_flat: form.getFieldValue('commission_flat'),
    commission_percent: form.getFieldValue('commission_percent') / 100.0,
  };
}

export async function createRateMarkup(
  rateTableId: number,
  rateMarkup: IRateTableMarkup
): Promise<void> {
  try {
    await axios.post(`${RATE_TABLES_API}/${rateTableId}/markups`, rateMarkup);
  } catch (e) {
    console.error(e);
  }
}

export async function updateRateMarkup(
  rateTableId: number,
  rateMarkup: IRateTableMarkup
): Promise<void> {
  try {
    await axios.put(
      `${RATE_TABLES_API}/${rateTableId}/markups/${rateMarkup.id}`,
      rateMarkup
    );
  } catch (e) {
    console.error(e);
  }
}


