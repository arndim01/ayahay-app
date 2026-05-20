import { Controller, Get, Query } from '@nestjs/common';
import { ShippingLineRouteService } from './shipping-line-route.service';

@Controller('shipping-line-route')
export class ShippingLineRouteController {
  constructor(private readonly shippingLineRouteService: ShippingLineRouteService) {}

  @Get('estimated-arrival')
  async getEstimatedArrival(
    @Query('srcPortId') srcPortId: number,
    @Query('destPortId') destPortId: number,
    @Query('shipId') shipId?: number,
  ) {
    const arrival = await this.shippingLineRouteService.getEstimatedArrival(
      Number(srcPortId),
      Number(destPortId),
      shipId ? Number(shipId) : undefined,
    );

    return arrival || { message: 'No estimated time of arrival found' };
  }

  @Get('arrival-time')
  async getArrivalTime(
    @Query('srcPortId') srcPortId: number,
    @Query('destPortId') destPortId: number,
    @Query('tripId') tripId: number,
    @Query('shipId') shipId?: number,
  ) {
    try {
      const result = await this.shippingLineRouteService.getArrivalTime(
        Number(srcPortId),
        Number(destPortId),
        Number(tripId),
        shipId ? Number(shipId) : undefined,
      );
      return result;
    } catch (error) {
      return { message: error.message };
    }
  }
}
