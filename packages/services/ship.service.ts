import { SHIPS_API } from '@ayahay/constants';
import { IShip } from '@ayahay/models';
import axios from './axios';
import { cacheItem, fetchItem } from './cache.service';

export async function getShips(): Promise<IShip[] | undefined> {
  const cachedShips = fetchItem<IShip[]>('ships');
  if (cachedShips !== undefined) {
    return cachedShips;
  }

  try {
    const { data } = await axios.get(`${SHIPS_API}/my-shipping-line`);
    cacheItem('ships', data, 60 * 24 * 7);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getShip(shipId: number): Promise<IShip> {
  const ships = await getShips();
  return ships?.find((ship) => ship.id === shipId)!;
}
