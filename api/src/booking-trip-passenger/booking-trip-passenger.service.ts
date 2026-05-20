import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingTripPassengerService {
  constructor(private prisma: PrismaService) {}

  private toTitleCase(str: string) {
    return str.toLowerCase().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async getPassengersByTripId(tripId: number) {
    try {
      const passengers = await this.prisma.bookingTripPassenger.findMany({
        where: { 
          tripId: tripId 
        },
        select: {
          bookingId: true,
          passenger: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          cabin: {
            select: {
              name: true
            }
          },
          discountType: true,
          checkInDate: true,
          booking: {
            select: {
              createdByAccount: {
                select: {
                  role: true
                }
              }
            }
          }
        }
      });

      if (passengers.length === 0) {
        return []; // Return empty array instead of throwing error
      }

      return passengers.map(p => ({
        reference: p.bookingId.slice(0, 6).toUpperCase(),
        passengerName: this.toTitleCase(`${p.passenger.firstName} ${p.passenger.lastName}`),
        accommodation: p.cabin.name,
        discountType: p.discountType || 'Regular', // Changed from 'None' to 'Regular'
        paymentMethod: !p.booking?.createdByAccount ? 'ONLINE' : 
                      p.booking.createdByAccount.role === 'passenger' ? 'ONLINE' : 'OTC',
        status: p.checkInDate ? 'On-Board' : 'Not-Boarded',
        key: p.bookingId
      }));
    } catch (error) {
      console.error('Error fetching passengers:', error);
      throw new Error(`Failed to fetch passengers: ${error.message}`);
    }
  }
}
