import {
  Request,
  Controller,
  Get,
  Param,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ShippingLineService } from './shipping-line.service';
import { IPort, IShippingLine, IShippingLineSchedule } from '@ayahay/models';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { ApiExcludeController, ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('shipping-lines')
@ApiExcludeController()
export class ShippingLineController {
  constructor(private shippingLineService: ShippingLineService) {}

  @Get()
  async getShippingLines(): Promise<IShippingLine[]> {
    return await this.shippingLineService.getShippingLines();
  }

  @Get(':id/schedules')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async getSchedulesOfShippingLine(
    @Param('id') shippingLineId: number,
    @Request() req
  ): Promise<IShippingLineSchedule[]> {
    return this.shippingLineService.getSchedulesOfShippingLine(
      shippingLineId,
      req.user
    );
  }

  @Get(':shippingLineId/ports')
  @ApiExcludeEndpoint()
  async getPortsByShippingLine(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IPort[]> {
    return await this.shippingLineService.getPortsByShippingLine(
      shippingLineId
    );
  }

  @Post(':shippingLineId/populate-ports')
  @UseGuards(AuthGuard)
  @Roles('SuperAdmin')
  @ApiExcludeEndpoint()
  async populateShippingLinePorts(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<{ message: string; count: number }> {
    return await this.shippingLineService.populateShippingLinePorts(
      shippingLineId
    );
  }
}
