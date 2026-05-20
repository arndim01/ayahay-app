import { IShippingLine } from './shipping-line.model';
import { IRateTableRow } from './rate-table-row.model';
import { IRateTableMarkup } from './rate-table-markup.model';

export interface IRateTable {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;

  name: string;

  rows: IRateTableRow[];
  markups: IRateTableMarkup[];
}
