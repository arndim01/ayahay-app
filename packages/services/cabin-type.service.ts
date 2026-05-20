import { CABIN_TYPES_API } from '@ayahay/constants';
import { ICabinType } from '@ayahay/models';
import axios from './axios';
import { cacheItem, fetchItem } from './cache.service';

export async function getCabinTypes(): Promise<ICabinType[] | undefined> {
  const cachedCabinTypes = fetchItem<ICabinType[]>('cabin-types');
  if (cachedCabinTypes !== undefined) {
    return cachedCabinTypes;
  }

  try {
    const { data } = await axios.get(`${CABIN_TYPES_API}`);
    cacheItem('cabin-types', data);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getCabinType(cabinTypeId: number): Promise<ICabinType> {
  const cabinTypes = await getCabinTypes();
  return cabinTypes?.find((cabinType) => cabinType.id === cabinTypeId)!;
}
