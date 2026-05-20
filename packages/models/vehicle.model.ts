import { IAccount } from './account.model';
import { IVehicleType } from './vehicle-type.model';

export interface IVehicle {
  id: number;
  accountId?: string;
  account?: IAccount;
  vehicleTypeId: number;
  vehicleType?: IVehicleType;

  plateNo: string;
  modelName: string;
  modelYear: number;

  officialReceiptUrl: string;
  certificateOfRegistrationUrl: string;
}
