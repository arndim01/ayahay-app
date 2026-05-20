import { Module } from '@nestjs/common';
import { RateTableRowController } from './rate-table-row.controller';
import { RateTableRowService } from './rate-table-row.service';

@Module({
  controllers: [RateTableRowController],
  providers: [RateTableRowService],
  exports: [RateTableRowService],
})
export class RateTableRowModule {}
