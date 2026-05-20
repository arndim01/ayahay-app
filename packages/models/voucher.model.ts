import { IAccount } from './account.model';

export interface IVoucher {
  code: string;
  createdByAccountId: string;
  createdByAccount?: IAccount;

  description: string;
  discountFlat: number;
  discountPercent: number;
  /**
   * if null, this voucher can be used
   * unlimited times until the expiry date
   */
  numberOfUses?: number;
  remainingUses?: number;
  expiryIso: string;
  canBookOnline: boolean;

  /**
   * TODO: add more conditions for voucher validity, e.g.:
   * - add shippingLineId for "20% off for Aznar bookings"
   * - add srcPortId for "20% off for trips from Bogo"
   * - etc.
   */
  minVehicles?: number;
}
