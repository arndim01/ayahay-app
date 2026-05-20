import { IShip } from '@ayahay/models';
import { mockShippingLine } from './shipping-line.mock';
import { mockCabins } from './cabin.mock';

export const mockShip: IShip = {
  id: 1,
  name: 'Cokaliong',
  shippingLineId: mockShippingLine.id,
  recommendedVehicleCapacity: 10,
  cabins: mockCabins,
};

export const mockShips: IShip[] = [
  mockShip,
  {
    id: 2,
    name: 'Gothong',
    shippingLineId: mockShippingLine.id,
    recommendedVehicleCapacity: 10,
    cabins: mockCabins,
  },
];
