import { Module } from '@nestjs/common';
import { BookingTripPassengerController } from './booking-trip-passenger.controller';
import { BookingTripPassengerService } from './booking-trip-passenger.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingTripPassengerController],
  providers: [BookingTripPassengerService],
})
export class BookingTripPassengerModule {}
