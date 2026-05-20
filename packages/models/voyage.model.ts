import { ITrip } from './trip.model';
import { IShip } from './ship.model';

/**
 * Represents a ship's voyage, with or without passenger/vehicle
 * bookings. Primarily used for tracking when a ship needs maintenance
 */
export interface IVoyage {
  id: number;
  shipId: number;
  ship?: IShip;
  tripId?: number;
  /**
   * trip is not null if the voyage was used for passenger/vehicle
   * booking
   */
  trip?: ITrip;

  number: number;
  dateIso: string;
  /**
   * remarks for the voyage; this is especially important to audit
   * cases where ship left the dock without a booking
   */
  remarks: string;
}
