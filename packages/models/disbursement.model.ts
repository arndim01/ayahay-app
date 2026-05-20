import { OPERATION_COSTS } from '@ayahay/constants';
import { IAccount } from './account.model';

export interface IDisbursement {
  id: number;
  createdByAccountId?: string;
  createdByAccount?: IAccount;
  dateIso: string;
  officialReceipt: string;
  paidTo: string;
  description: OPERATION_COSTS;
  purpose: string;
  amount: number;
}
