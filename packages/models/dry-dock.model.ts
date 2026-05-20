import { IShip } from './ship.model';

/**
 * Represents a maintenance for a ship
 */
export interface IDryDock {
  id: number;
  shipId: number;
  ship?: IShip;

  dateIso: string;
}
