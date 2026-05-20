import { Injectable } from '@nestjs/common';
import { ITravelAgency } from '@ayahay/models';

@Injectable()
export class TravelAgencyMapper {
  constructor() {}

  convertTravelAgencyToDto(travelAgency: any): ITravelAgency {
    if (!travelAgency) {
      return undefined;
    }

    return {
      id: travelAgency.id,
      name: travelAgency.name,
    };
  }

  convertTravelAgencyToEntity(travelAgency: ITravelAgency): any {
    return null;
  }
}
