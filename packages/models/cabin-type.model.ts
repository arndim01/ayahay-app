import { IShippingLine } from './shipping-line.model';

/**
 * We create a separate table instead of an enum for Cabin Type because
 * there is no "standard" list of cabin types that is used by all shipping liners
 * e.g. Aznar has Aircon, Non-Aircon cabin types, but other shipping lines probably
 * have Economy, First Class, or some other combinations.
 * This separation will enable each shipping line to have their own Cabin Type
 *
 * So in Trip Search, filtering by Cabin Type is disabled until the search is
 * filtered by Shipping Line
 * e.g. For Aznar's Aircon, Non-Aircon cabin types to be "selectable" or "filterable",
 * Aznar should be selected in the Shipping Line filter first.
 */
export interface ICabinType {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;

  name: string;
  description: string;
}

export const AZNAR_AIRCON_CABIN: ICabinType = {
  id: 1,
  shippingLineId: -1,
  name: 'Aircon',
  description: '',
};

export const AZNAR_NON_AIRCON_CABIN: ICabinType = {
  id: 2,
  shippingLineId: -1,
  name: 'Non-Aircon',
  description: '',
};

// TODO: FE should fetch this list from the DB in the future
export const AZNAR_CABIN_TYPES: ICabinType[] = [
  AZNAR_AIRCON_CABIN,
  AZNAR_NON_AIRCON_CABIN,
];
