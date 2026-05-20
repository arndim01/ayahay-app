import { IAccount } from './account.model';
import { INotification } from './notification.model';

export interface IAccountNotification {
  accountId: string;
  account?: IAccount;
  notificationId: number;
  notification?: INotification;

  isRead: boolean;
}
