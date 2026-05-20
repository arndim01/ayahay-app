import { Module } from '@nestjs/common';
import { RateTableController } from './rate-table.controller';
import { RateTableService } from './rate-table.service';

@Module({
  controllers: [RateTableController],
  providers: [RateTableService],
  exports: [RateTableService],
})
export class RateTableModule {}
