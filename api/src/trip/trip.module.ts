import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripValidator } from './trip.validator';
import { ShippingLineService } from '@/shipping-line/shipping-line.service';
import { ShipService } from '@/ship/ship.service';
import { EmailModule } from '@/email/email.module';
import { CabinService } from '@/cabin/cabin.service';

@Module({
  imports: [EmailModule],
  controllers: [TripController],
  providers: [
    TripService,
    ShippingLineService,
    ShipService,
    TripValidator,
    CabinService,
  ],
  exports: [TripService],
})
export class TripModule {}
