import { SHIPPING_LINE_API } from '@ayahay/constants';
import { IShippingLine } from '@ayahay/models';
import axios from './axios';
import { cacheItem, fetchItem } from './cache.service';

export async function getShippingLines(): Promise<IShippingLine[] | undefined> {
  const cachedShippingLines = fetchItem<IShippingLine[]>('shipping-lines');
  if (cachedShippingLines !== undefined) {
    return cachedShippingLines;
  }

  try {
    const { data } = await axios.get(`${SHIPPING_LINE_API}`);
    cacheItem('shipping-lines', data, 60 * 24 * 7);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getShippingLine(
  shippingLineId: number
): Promise<IShippingLine> {
  const shippingLines = await getShippingLines();
  return shippingLines?.find(
    (shippingLine) => shippingLine.id === shippingLineId
  )!;
}
