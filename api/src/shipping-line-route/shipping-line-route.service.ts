//This is not being used but created this just in case it is needed in the future your loyal dev - Rob
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShippingLineRouteService {
  constructor(private readonly prisma: PrismaService) {}

  async getEstimatedArrival(
    srcPortId: number,
    destPortId: number,
    shipId?: number,
  ) {
    return this.prisma.shipping_line_route.findFirst({
      where: {
        src_port_id: srcPortId,
        dest_port_id: destPortId,
        ...(shipId && { ship_id: shipId }), 
      },
      select: {
        estimated_time_arrival: true,
      },
    });
  }

  async getArrivalTime(
    srcPortId: number,
    destPortId: number,
    tripId: number,
    shipId?: number,
  ) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { departureDate: true, shipId: true },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    const route = await this.prisma.shipping_line_route.findFirst({
        where: {
            src_port_id: srcPortId,
            dest_port_id: destPortId,
            ...(shipId && { ship_id: shipId }), 
          },
      select: { estimated_time_arrival: true },
    });

    if (!route) {
      throw new Error('Route not found');
    }

    const departureDate = new Date(trip.departureDate);
    const arrivalTime = new Date(departureDate.getTime() + route.estimated_time_arrival * 60000);

    return {
      departureDate: trip.departureDate,
      estimatedTimeArrival: route.estimated_time_arrival,
      arrivalTime: arrivalTime.toISOString()
    };
  }
}
