import { IPort } from './port.model';
import { IShippingLine } from './shipping-line.model';
import { IShip } from './ship.model';
import { IRateTable } from './rate-table.model';

export interface IShippingLineSchedule {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  shipId: number;
  ship?: IShip;
  rateTableId: number;
  rateTable?: IRateTable;

  name: string;
  departureHour: number;
  departureMinute: number;
  daysBeforeBookingStart: number;
  daysBeforeBookingCutOff: number;
}
