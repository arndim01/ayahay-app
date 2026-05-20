import { NOTIFICATION_API } from '@ayahay/constants';
import axios from './axios';
import { INotification } from '@ayahay/models';
import { PaginatedRequest } from '@ayahay/http';
import { cacheItem, fetchItem } from './cache.service';

export async function getMyNotifications(
  pagination: PaginatedRequest
): Promise<INotification[] | undefined> {
  let cachedNotifications =
    fetchItem<NotificationCache>('my-notifications') ?? {};

  if (cachedNotifications[pagination.page] !== undefined) {
    return cachedNotifications[pagination.page];
  }

  try {
    const query = new URLSearchParams(pagination as any).toString();
    const { data: notifications } = await axios.get<INotification[]>(
      `${NOTIFICATION_API}/mine?${query}`
    );

    cachedNotifications[pagination.page] = notifications;
    cacheItem('my-notifications', cachedNotifications, 60);

    return notifications;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function createAnnouncement(
  notification: INotification
): Promise<void> {
  return axios.post(`${NOTIFICATION_API}/public`, notification);
}

type NotificationCache = { [page: number]: INotification[] };
