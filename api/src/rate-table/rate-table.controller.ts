import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { RateTableService } from './rate-table.service';
import { IRateTable, IRateTableMarkup } from '@ayahay/models';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('rate-tables')
@ApiExcludeController()
export class RateTableController {
  constructor(private rateTableService: RateTableService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async getPublicRateTableById(
    @Param('id') rateTableId: number,
    @Request() req
  ): Promise<IRateTable> {
    return this.rateTableService.getPublicRateTableById(rateTableId, req.user);
  }

  @Get(':id/full')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async getFullRateTableById(
    @Param('id') rateTableId: number,
    @Request() req
  ): Promise<IRateTable> {
    return this.rateTableService.getFullRateTableById(rateTableId, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async getRateTables(@Request() req): Promise<IRateTable[]> {
    return this.rateTableService.getRateTables(req.user);
  }

  // TODO: Refactor rate tables to have ship and port IDs so we can filter by IDs instead of ship names
  @Get('srcPort/:srcPortName/destPort/:destPortName/ship/:shipName')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async getRateTablesByShippingLineIdAndName(
    @Param('srcPortName') srcPortName: string,
    @Param('destPortName') destPortName: string,
    @Param('shipName') shipName: string,
    @Request() req
  ): Promise<IRateTable[]> {
    return this.rateTableService.getRateTablesByShippingLineIdAndName(
      req.user.shippingLineId,
      srcPortName,
      destPortName,
      shipName
    );
  }

  @Post(':id/markups')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async createRateMarkup(
    @Body() rateMarkup: IRateTableMarkup,
    @Request() req
  ): Promise<void> {
    return this.rateTableService.createRateMarkup(rateMarkup, req.user);
  }

  @Put(':id/markups/:rateMarkupId')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async updateRateMarkup(
    @Param('rateMarkupId') rateMarkupId: number,
    @Body() rateMarkup: IRateTableMarkup,
    @Request() req
  ): Promise<void> {
    return this.rateTableService.updateRateMarkup(
      rateMarkupId,
      rateMarkup,
      req.user
    );
  }
}
