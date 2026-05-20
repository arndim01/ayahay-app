import { IShippingLine } from './shipping-line.model';

/**
 * We create a separate table instead of an enum for Seat Type because
 * there is no "standard" list of seat types that is used by all shipping liners
 * This separation will enable each shipping line to have their own Seat Type
 */
export interface ISeatType {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;

  name: string;
  description: string;
}
