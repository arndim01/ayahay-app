import { ITrip } from './trip.model';
import { IAccountNotification } from './account-notification.model';

export interface INotification {
  id: number;
  tripId?: number;
  trip?: ITrip;

  subject: string;
  body: string;
  dateCreatedIso: string;
}
