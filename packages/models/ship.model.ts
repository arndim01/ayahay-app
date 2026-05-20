import { ICabin } from './cabin.model';
import { IShippingLine } from './shipping-line.model';
import { IVoyage } from './voyage.model';
import { IDryDock } from './dry-dock.model';

export interface IShip {
  id: number;
  name: string;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  recommendedVehicleCapacity: number;
  cargoRequired: boolean;
  cabins?: ICabin[];
  voyages?: IVoyage[];
  dryDocks?: IDryDock[];
}
