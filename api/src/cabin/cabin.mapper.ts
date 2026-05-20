import { Injectable } from '@nestjs/common';
import { ICabin, ICabinType } from '@ayahay/models';

@Injectable()
export class CabinMapper {
  constructor() {}

  convertCabinToDto(cabin: any): ICabin {
    return {
      id: cabin.id,
      shipId: cabin.shipId,
      cabinTypeId: cabin.cabinTypeId,
      cabinType: this.convertCabinTypeToDto(cabin.cabinType),

      name: cabin.name,
      recommendedPassengerCapacity: cabin.recommendedPassengerCapacity,
    };
  }

  convertCabinTypeToDto(cabinType: any): ICabinType | undefined {
    if (!cabinType) {
      return undefined;
    }

    return {
      id: cabinType.id,
      shippingLineId: cabinType.shippingLineId,

      name: cabinType.name,
      description: cabinType.description,
    };
  }
}
