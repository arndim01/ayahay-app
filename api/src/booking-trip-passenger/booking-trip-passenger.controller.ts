import { Controller, Get, Param } from '@nestjs/common';
import { BookingTripPassengerService } from './booking-trip-passenger.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Booking Trip Passengers')
@Controller('api/booking-trip-passengers')
export class BookingTripPassengerController {
  constructor(private readonly service: BookingTripPassengerService) {}

  @Get('trip/:tripId')
  async findPassengersByTripId(@Param('tripId') tripId: string) {
    return this.service.getPassengersByTripId(Number(tripId)); // Changed method name to match service
  }
}
