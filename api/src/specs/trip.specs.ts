import {
  ICabin,
  ICabinType,
  IPort,
  IShip,
  IShippingLine,
  ITrip,
  ITripCabin,
} from '@ayahay/models';

export class Trip {
  availableCabins: TripCabin[];
  availableVehicleCapacity: number;
  departureDateIso: string;
  destPort: Port;
  destPortId: number;
  id: number;
  rateTableId: number;
  referenceNo: string;
  ship: Ship;
  shipId: number;
  shippingLine: ShippingLine;
  shippingLineId: number;
  srcPort: Port;
  srcPortId: number;
  vehicleCapacity: number;
}

class TripCabin implements ITripCabin {
  cabin: Cabin;
  cabinId: number;
  tripId: number;
  availablePassengerCapacity: number;
  passengerCapacity: number;
}

class Cabin implements ICabin {
  cabinType: CabinType;
  cabinTypeId: number;
  id: number;
  name: string;
  recommendedPassengerCapacity: number;
  shipId: number;
}

class CabinType implements ICabinType {
  description: string;
  id: number;
  name: string;
  shippingLineId: number;
}

export class Port implements IPort {
  id: number;
  code: string;
  name: string;
}

class Ship implements IShip {
  id: number;
  recommendedVehicleCapacity: number;
  cargoRequired: boolean;
  name: string;
  shippingLineId: number;
}

class ShippingLine implements IShippingLine {
  id: number;
  name: string;
  logoFilename: string;
}

export class GetTripsQuery {
  srcPortId: number;
  destPortId: number;
  departureDate: string;
  passengerCount: number;
  vehicleCount: number;
}
