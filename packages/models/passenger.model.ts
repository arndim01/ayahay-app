import {
  CIVIL_STATUS,
  DISCOUNT_TYPE,
  OCCUPATION,
  SEX,
} from '@ayahay/constants/enum';
import { IAccount } from './account.model';

export interface IPassenger {
  id: number;
  account?: IAccount;
  buddyId?: number;
  buddy?: IPassenger;

  firstName: string;
  lastName: string;
  occupation: keyof typeof OCCUPATION;
  sex: keyof typeof SEX;
  civilStatus: keyof typeof CIVIL_STATUS;
  birthdayIso?: string;
  address: string;
  nationality: string;
  discountType?: keyof typeof DISCOUNT_TYPE;

  companions?: IPassenger[];
}
