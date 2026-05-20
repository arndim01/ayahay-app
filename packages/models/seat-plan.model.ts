import { IShippingLine } from './shipping-line.model';
import { ISeat } from './seat.model';

export interface ISeatPlan {
  id: number;
  shippingLineId: number;
  shippingLine: IShippingLine;

  name: string;
  rowCount: number;
  columnCount: number;

  seats: ISeat[];
}
