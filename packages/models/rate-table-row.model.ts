import { IRateTable } from './rate-table.model';
import { ICabin } from './cabin.model';
import { IVehicleType } from './vehicle-type.model';
import { DISCOUNT_TYPE } from '@ayahay/constants';

export interface IRateTableRow {
  id: number;
  rateTableId: number;
  rateTable?: IRateTable;
  // if not null, this rate is for the specified cabin
  cabinId?: number;
  cabin?: ICabin;
  /**
   * this field works together with cabinId:
   * if null, this rate is for adult passengers for the specified cabin
   * if not null, this rate is for passengers of the specified discount type
   * for the specified cabin
   */
  discountType?: keyof typeof DISCOUNT_TYPE;
  // if not null, this rate is for the specified vehicle type
  vehicleTypeId?: number;
  vehicleType?: IVehicleType;

  fare: number;
  canBookOnline: boolean;
}
