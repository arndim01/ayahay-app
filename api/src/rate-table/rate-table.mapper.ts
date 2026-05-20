import { Injectable } from '@nestjs/common';
import { IRateTable, IRateTableRow, IRateTableMarkup } from '@ayahay/models';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { CabinMapper } from '@/cabin/cabin.mapper';
import { Prisma } from '@prisma/client';
import { TravelAgencyMapper } from '@/travel-agency/travel-agency.mapper';
import { RateTable, RateTableRow } from '@prisma/client';

@Injectable()
export class RateTableMapper {
  constructor(
    private readonly cabinMapper: CabinMapper,
    private readonly vehicleMapper: VehicleMapper,
    private readonly travelAgencyMapper: TravelAgencyMapper
  ) {}

  convertRateTableSimpleDto(rateTable: RateTable): IRateTable {
    return {
      id: rateTable.id,
      shippingLineId: rateTable.shippingLineId,
      name: rateTable.name,
      rows: [],
      markups: [],
    };
  }

  convertRateTableToPublicDto(rateTable: any): IRateTable {
    return {
      id: rateTable.id,
      shippingLineId: rateTable.shippingLineId,
      name: rateTable.name,
      rows: rateTable.rows.map((row: any) =>
        this.convertRateTableRowToDto(row)
      ),
      markups: [],
    };
  }

  convertRateTableToPrivilegedDto(rateTable: any): IRateTable {
    return {
      id: rateTable.id,
      shippingLineId: rateTable.shippingLineId,
      name: rateTable.name,
      rows: rateTable.rows.map((row: any) =>
        this.convertRateTableRowToDto(row)
      ),
      markups: rateTable.markups.map((markup: any) => ({
        id: markup.id,
        rateTableId: markup.rateTableId,
        travelAgencyId: markup.travelAgencyId,
        clientId: markup.clientId,
        markupFlat: markup.markupFlat,
        markupPercent: markup.markupPercent,
        markupMaxFlat: markup.markupMaxFlat,
        travelAgency: markup.travelAgency,
        client: markup.client,
      })),
    };
  }

  convertRateTableRowToDto(row: any): IRateTableRow {
    return {
      id: row.id,
      rateTableId: row.rateTableId,
      cabinId: row.cabinId,
      cabin: row.cabin
        ? {
            id: row.cabin.id,
            shipId: row.cabin.shipId,
            cabinTypeId: row.cabin.cabinTypeId,
            name: row.cabin.name,
            recommendedPassengerCapacity:
              row.cabin.recommendedPassengerCapacity,
          }
        : undefined,
      discountType: row.discountType,
      vehicleTypeId: row.vehicleTypeId,
      vehicleType: row.vehicleType,
      fare: row.fare,
      canBookOnline: row.canBookOnline,
    };
  }

  convertRateTableMarkupToDto(rateTableMarkup: any): IRateTableMarkup {
    return {
      id: rateTableMarkup.id,
      rateTableId: rateTableMarkup.rateTableId,
      travelAgencyId: rateTableMarkup.travelAgencyId ?? undefined,
      travelAgency: this.travelAgencyMapper.convertTravelAgencyToDto(
        rateTableMarkup.travelAgency
      ),
      clientId: rateTableMarkup.clientId ?? undefined,
      markupFlat: rateTableMarkup.markupFlat,
      markupPercent: rateTableMarkup.markupPercent,
      markupMaxFlat: rateTableMarkup.markupMaxFlat,
      markupFlatCargo: rateTableMarkup.markupFlatCargo,
      markupPercentCargo: rateTableMarkup.markupPercentCargo,
      markupMaxFlatCargo: rateTableMarkup.markupMaxFlatCargo,
      commission_flat: rateTableMarkup.commission_flat,
      commission_percent: rateTableMarkup.commission_percent,
      commission_flat_cargo: rateTableMarkup.commission_flat_cargo,
      commission_percent_cargo: rateTableMarkup.commission_percent_cargo,
    };
  }

  convertRateTableMarkupToEntityForCreation(
    rateTableMarkup: IRateTableMarkup
  ): Prisma.RateTableMarkupCreateInput {
    return {
      rateTable: {
        connect: {
          id: rateTableMarkup.rateTableId,
        },
      },
      travelAgency: rateTableMarkup.travelAgencyId
        ? {
            connect: {
              id: rateTableMarkup.travelAgencyId,
            },
          }
        : undefined,
      client: rateTableMarkup.clientId
        ? {
            connect: {
              id: rateTableMarkup.clientId,
            },
          }
        : undefined,
      markupFlat: rateTableMarkup.markupFlat,
      markupPercent: rateTableMarkup.markupPercent,
      markupMaxFlat: rateTableMarkup.markupMaxFlat,
      markupFlatCargo: rateTableMarkup.markupFlatCargo,
      markupPercentCargo: rateTableMarkup.markupPercentCargo,
      markupMaxFlatCargo: rateTableMarkup.markupMaxFlatCargo,
      commission_flat: rateTableMarkup.commission_flat,
      commission_percent: rateTableMarkup.commission_percent,
      commission_flat_cargo: rateTableMarkup.commission_flat_cargo,
      commission_percent_cargo: rateTableMarkup.commission_percent_cargo,
    };
  }
}
