import { IShip } from './ship.model';
import { ICabinType } from './cabin-type.model';
import { ISeatPlan } from './seat-plan.model';

export interface ICabin {
  id: number;
  shipId: number;
  ship?: IShip;
  cabinTypeId: number;
  cabinType?: ICabinType;
  defaultSeatPlanId?: number;
  defaultSeatPlan?: ISeatPlan;

  name: string;
  recommendedPassengerCapacity: number;
}
