import { Injectable } from '@nestjs/common';
import { ISeat, ISeatPlan, ISeatType } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class SeatPlanMapper {
  constructor() {}

  convertSeatToDto(seat: any): ISeat {
    if (!seat) {
      return undefined;
    }

    return {
      id: seat.id,
      seatPlanId: seat.seatPlanId,
      seatTypeId: seat.seatTypeId,
      seatType: this.convertSeatTypeToDto(seat.seatType),
      name: seat.name,
      rowNumber: seat.rowNumber,
      columnNumber: seat.columnNumber,
    };
  }

  convertSeatTypeToDto(seatType: any): ISeatType {
    if (!seatType) {
      return undefined;
    }

    return {
      id: seatType.id,
      shippingLineId: seatType.shippingLineId,
      name: seatType.name,
      description: seatType.description,
    };
  }

  convertSeatPlanToEntityForCreation(
    seatPlan: ISeatPlan
  ): Prisma.SeatPlanCreateArgs {
    return {
      data: {
        shippingLineId: seatPlan.shippingLineId,
        name: seatPlan.name,
        rowCount: seatPlan.rowCount,
        columnCount: seatPlan.columnCount,
        seats: {
          createMany: {
            data: seatPlan.seats.map((seat) => ({
              seatTypeId: seat.seatTypeId,
              name: seat.name,
              rowNumber: seat.rowNumber,
              columnNumber: seat.columnNumber,
            })),
          },
        },
      },
    };
  }
}
