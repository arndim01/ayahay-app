import { Module } from '@nestjs/common';
import { BookingTripVehicleController } from './booking-trip-vehicle.controller';
import { BookingTripVehicleService } from './booking-trip-vehicle.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingTripVehicleController],
  providers: [BookingTripVehicleService],
})
export class BookingTripVehicleModule {}
