import { Injectable } from '@nestjs/common';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { CabinMapper } from '@/cabin/cabin.mapper';
import { IRateTableRow } from '@ayahay/models';

@Injectable()
export class RateTableRowMapper {
  constructor(
    private readonly cabinMapper: CabinMapper,
    private readonly vehicleMapper: VehicleMapper,
  ) {}

  convertRateTableRowToDto(rateTableRow: any): IRateTableRow {
      return {
        id: rateTableRow.id,
        rateTableId: rateTableRow.rateTableId,
        cabinId: rateTableRow.cabinId ?? undefined,
        cabin:
          rateTableRow.cabin !== null
            ? this.cabinMapper.convertCabinToDto(rateTableRow.cabin)
            : undefined,
        discountType: rateTableRow.discountType ?? undefined,
        vehicleTypeId: rateTableRow.vehicleTypeId ?? undefined,
        vehicleType:
          rateTableRow.vehicleType !== null
            ? this.vehicleMapper.convertVehicleTypeToDto(rateTableRow.vehicleType)
            : undefined,
        fare: rateTableRow.fare,
        canBookOnline: rateTableRow.canBookOnline,
      };
    }
}
