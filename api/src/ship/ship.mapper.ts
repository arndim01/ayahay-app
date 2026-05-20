import { Injectable } from '@nestjs/common';
import { IDryDock, IShip, IVoyage } from '@ayahay/models';
import { CabinMapper } from '@/cabin/cabin.mapper';

@Injectable()
export class ShipMapper {
  constructor(private readonly cabinMapper: CabinMapper) {}

  convertShipToDto(ship: any): IShip {
    const cabins = ship.cabins?.map((cabin) =>
      this.cabinMapper.convertCabinToDto(cabin)
    );

    return {
      id: ship.id,
      name: ship.name,
      shippingLineId: ship.shippingLineId,
      recommendedVehicleCapacity: ship.recommendedVehicleCapacity,
      cargoRequired: ship.cargoRequired,
      cabins,
    };
  }

  convertVoyageToDto(voyage: any): IVoyage {
    return {
      id: voyage.id,
      shipId: voyage.shipId,
      tripId: voyage.tripId,

      number: voyage.number,
      dateIso: voyage.date.toISOString(),
      remarks: voyage.remarks,
    };
  }

  convertDryDockToDto(dryDock: any): IDryDock {
    return {
      id: dryDock.id,
      shipId: dryDock.shipId,

      dateIso: dryDock.date.toISOString(),
    };
  }
}
