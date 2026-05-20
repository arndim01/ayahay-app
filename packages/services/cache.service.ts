import dayjs from 'dayjs';
import { CacheKey } from '@ayahay/constants';

export function cacheItem(
  key: CacheKey,
  item: any,
  expirationInMinutes?: number
) {
  expirationInMinutes ??= 60 * 24 * 365;

  localStorage.setItem(
    key,
    JSON.stringify({
      data: item,
      expiration: dayjs().add(expirationInMinutes, 'minute').toISOString(),
    })
  );
}

export function fetchItem<T>(key: CacheKey): T | undefined {
  const cachedItemJson = localStorage.getItem(key);
  if (cachedItemJson === null) {
    return undefined;
  }

  const { data, expiration } = JSON.parse(cachedItemJson);
  if (dayjs().isAfter(dayjs(expiration))) {
    return undefined;
  }

  return data;
}

export function invalidateItem(key: CacheKey) {
  localStorage.removeItem(key);
}
