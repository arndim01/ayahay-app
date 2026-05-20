import { Module } from '@nestjs/common';
import { SeatPlanController } from './seat-plan.controller';
import { SeatPlanService } from './seat-plan.service';

@Module({
  controllers: [SeatPlanController],
  providers: [SeatPlanService],
  exports: [SeatPlanService],
})
export class SeatPlanModule {}
