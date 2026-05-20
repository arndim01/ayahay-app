import { ITrip } from '@ayahay/models';
import { mockShip } from './ship.mock';
import { mockShippingLine } from './shipping-line.mock';
import { mockPort, mockPort2, mockPort3 } from './port.mock';

const todayDate = new Date();
const today = todayDate.toISOString();
todayDate.setDate(todayDate.getDate() + 5);
const fiveDaysLater = todayDate.toISOString();
todayDate.setDate(todayDate.getDate() + 5);
const tenDaysLater = todayDate.toISOString();

export const mockTrip: ITrip = {
  id: 1,
  referenceNo: `ABCD1`,
  shipId: mockShip.id,
  ship: mockShip,
  shippingLineId: mockShippingLine.id,
  shippingLine: mockShippingLine,
  srcPortId: mockPort.id,
  srcPort: mockPort,
  destPortId: mockPort2.id,
  destPort: mockPort2,
  departureDateIso: today,
  availableSeatTypes: [
    'Aisle',
    'SingleBed',
    'Window',
    'LowerBunkBed',
    'UpperBunkBed',
  ],
  seatSelection: false,
  availableVehicleCapacity: 10,
  vehicleCapacity: 10,
  bookingStartDateIso: today,
  bookingCutOffDateIso: today,
  availableCabins: [],
  availableVehicleTypes: [],
  meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
};

export const mockTrips: ITrip[] = [
  mockTrip,
  {
    id: 2,
    referenceNo: `ABCD2`,
    shipId: mockShip.id,
    ship: mockShip,
    shippingLineId: mockShippingLine.id,
    shippingLine: mockShippingLine,
    srcPortId: mockPort.id,
    srcPort: mockPort2,
    destPortId: mockPort2.id,
    destPort: mockPort2,
    departureDateIso: fiveDaysLater,
    availableSeatTypes: [
      'Aisle',
      'SingleBed',
      'Window',
      'LowerBunkBed',
      'UpperBunkBed',
    ],
    seatSelection: false,
    availableVehicleCapacity: 10,
    vehicleCapacity: 10,
    bookingStartDateIso: today,
    bookingCutOffDateIso: today,
    availableCabins: [],
    availableVehicleTypes: [],
    meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
  },
  {
    id: 3,
    referenceNo: `ABCD2`,
    shipId: mockShip.id,
    ship: mockShip,
    shippingLineId: mockShippingLine.id,
    shippingLine: mockShippingLine,
    srcPortId: mockPort3.id,
    srcPort: mockPort3,
    destPortId: mockPort.id,
    destPort: mockPort,
    departureDateIso: tenDaysLater,
    availableSeatTypes: [
      'Aisle',
      'SingleBed',
      'Window',
      'LowerBunkBed',
      'UpperBunkBed',
    ],
    seatSelection: false,
    availableVehicleCapacity: 10,
    vehicleCapacity: 10,
    bookingStartDateIso: today,
    bookingCutOffDateIso: today,
    availableCabins: [],
    availableVehicleTypes: [],
    meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
  },
];
