import { ISeatType } from './seat-type.model';
import { ISeatPlan } from './seat-plan.model';

export interface ISeat {
  id: number;
  seatPlanId: number;
  seatPlan?: ISeatPlan;
  seatTypeId: number;
  /**
   * TODO: also add Trip Seat Type for trip-specific rate for each seat type
   * also add Seat Type for schedule rate
   */
  seatType?: ISeatType;

  name: string;
  rowNumber: number;
  columnNumber: number;
}
