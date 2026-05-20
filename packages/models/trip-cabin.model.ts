import { ITrip } from './trip.model';
import { ICabin } from './cabin.model';
import { ISeatPlan } from './seat-plan.model';

/**
 * Trip-specific information (e.g. passenger capacity) for Cabin
 * We have a separate table/model for this because of the following scenario:
 *
 * Cabin A is a ship that has a recommended passenger capacity of 100
 * Trip A and Trip B both are going to be using Cabin A
 *
 * Passengers boarding Trip A consist of many families with children, while
 * passengers boarding Trip B are mostly adults.
 *
 * Admins figure the recommended passenger capacity of Cabin A will suffice for Trip B,
 * but they think Trip A can still accommodate 20 more passengers.
 *
 * So for Trip A, they increase the passenger capacity of Cabin A.
 * This increase should not affect Trip B. Having a separate table will allow this.
 */
export interface ITripCabin {
  tripId: number;
  trip?: ITrip;
  cabinId: number;
  cabin?: ICabin;
  seatPlanId?: number;
  seatPlan?: ISeatPlan;

  availablePassengerCapacity: number;
  passengerCapacity: number;
}
