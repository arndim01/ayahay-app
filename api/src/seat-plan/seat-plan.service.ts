import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IAccount, ISeatPlan } from '@ayahay/models';
import { SeatPlanMapper } from '@/seat-plan/seat-plan.mapper';

@Injectable()
export class SeatPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seatPlanMapper: SeatPlanMapper
  ) {}

  async createSeatPlan(
    seatPlan: ISeatPlan,
    loggedInAccount: IAccount
  ): Promise<void> {
    seatPlan.shippingLineId =
      loggedInAccount.shippingLineId ?? seatPlan.shippingLineId;
    const seatPlanEntity =
      this.seatPlanMapper.convertSeatPlanToEntityForCreation(seatPlan);
    await this.prisma.seatPlan.create(seatPlanEntity);
  }
}
