import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiExcludeController,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { RateTableRowService } from './rate-table-row.service';
import { IRateTableRow } from '@ayahay/models';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';

@Controller('rate-table-rows')
@ApiExcludeController()
export class RateTableRowController {
  constructor(private rateTableRowService: RateTableRowService) {}

  @Get(':id')
  @ApiExcludeEndpoint()
  @AllowUnauthenticated()
  async getRateTableRowsByRateTableId(
    @Param('id') rateTableRowId: number
  ): Promise<IRateTableRow[]> {
    return this.rateTableRowService.getRateTableRowsByRateTableId(rateTableRowId);
  }
}