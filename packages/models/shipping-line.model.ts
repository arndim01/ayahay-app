import { ISeatType } from './seat-type.model';

export interface IShippingLine {
  id: number;
  name: string;
  logoFilename: string;
  seatTypes?: ISeatType[];
}
