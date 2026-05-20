import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SeatPlanService } from './seat-plan.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ISeatPlan } from '@ayahay/models';

@Controller('seat-plans')
export class SeatPlanController {
  constructor(private seatPlanService: SeatPlanService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async createSeatPlan(
    @Body() seatPlan: ISeatPlan,
    @Request() req
  ): Promise<void> {
    return this.seatPlanService.createSeatPlan(seatPlan, req.user);
  }
}
