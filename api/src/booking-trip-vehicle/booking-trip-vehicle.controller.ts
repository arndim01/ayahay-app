import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { BookingTripVehicleService } from './booking-trip-vehicle.service';
import { VehicleBookingResponseDto } from './dto/vehicle-booking-response.dto';

@Controller('api/booking-trip-vehicles')
export class BookingTripVehicleController {
  constructor(private readonly service: BookingTripVehicleService) {}

  @Get('trip/:tripId')
  async getVehiclesByTripId(@Param('tripId') tripId: string): Promise<VehicleBookingResponseDto[]> {
    try {
      return await this.service.findByTripId(tripId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch vehicle bookings',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
