import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { BookingModule } from '@/booking/booking.module';
import { ShipModule } from '@/ship/ship.module';
import { DisbursementModule } from '@/disbursement/disbursement.module';

@Module({
  imports: [BookingModule, ShipModule, DisbursementModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
