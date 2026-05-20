import { AZNAR_AIRCON_CABIN, ICabin } from '@ayahay/models';

export const mockCabinEconomy: ICabin = {
  id: 1,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabinEconomy2: ICabin = {
  id: 2,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'second floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabinBusiness: ICabin = {
  id: 3,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabinFirst: ICabin = {
  id: 4,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabins: ICabin[] = [
  mockCabinBusiness,
  mockCabinEconomy,
  mockCabinFirst,
];
