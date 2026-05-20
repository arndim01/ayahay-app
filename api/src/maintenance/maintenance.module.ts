import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MapperModule } from '../mapper.module';
import { ReceiptService } from '@/receipt/receipt.service';

@Module({
  imports: [MapperModule],
  controllers: [MaintenanceController],
  providers: [ReceiptService],
  exports: [ReceiptService]
})
export class MaintenanceModule {}
