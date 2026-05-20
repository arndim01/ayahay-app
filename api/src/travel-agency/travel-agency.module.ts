import { Module } from '@nestjs/common';
import { TravelAgencyController } from './travel-agency.controller';
import { TravelAgencyService } from './travel-agency.service';

@Module({
  controllers: [TravelAgencyController],
  providers: [TravelAgencyService],
  exports: [TravelAgencyService],
})
export class TravelAgencyModule {}
