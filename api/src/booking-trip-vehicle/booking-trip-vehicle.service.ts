import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleBookingResponseDto } from './dto/vehicle-booking-response.dto';

@Injectable()
export class BookingTripVehicleService {
  private readonly logger = new Logger(BookingTripVehicleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByTripId(tripId: string): Promise<VehicleBookingResponseDto[]> {
    try {
      const vehicles = await this.prisma.bookingTripVehicle.findMany({
        where: { 
          tripId: Number(tripId) 
        },
        include: {
          booking: {
            include: {
              createdByAccount: true
            }
          },
          vehicle: {
            include: {
              vehicleType: true
            }
          }
        }
      });

      return vehicles.map((v, index) => ({
        key: index.toString(),
        reference: v.bookingId.slice(0, 6).toUpperCase(),
        bol_no: v.bookingId.slice(0, 6).toUpperCase(),
        frr_no: v.booking?.freightRateReceipt || 'NA',
        plate_number: v.vehicle?.plateNo || 'Unknown',
        vehicle_type: v.vehicle?.vehicleType?.name || 'Unknown',
        payment_method: v.booking?.createdByAccount?.role === 'passenger' ? 'ONLINE' : 'OTC',
        status: v.checkInDate ? 'On-boarded' : 'Not-boarded'
      }));
    } catch (error) {
      this.logger.error(`Error fetching vehicles for tripId ${tripId}:`, error.stack);
      throw error;
    }
  }
}
