import { IShippingLine } from './shipping-line.model';
import { ITravelAgency } from './travel-agency.model';
import { WEBHOOK_TYPE } from '@ayahay/constants';

export interface IWebhook {
  id: number;
  shippingLineId?: number;
  shippingLine?: IShippingLine;
  travelAgencyId?: number;
  travelAgency?: ITravelAgency;

  type: keyof typeof WEBHOOK_TYPE;
  url: string;
}
