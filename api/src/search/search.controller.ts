import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { Booking, Trip } from '@prisma/client';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import {
  DashboardTrips,
  PaginatedRequest,
  PaginatedResponse,
} from '@ayahay/http';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('search')
@UseGuards(AuthGuard)
@ApiExcludeController()
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('bookings')
  @Roles('ShippingLineStaff', 'ShippingLineAdmin')
  async getBookingsByReferenceNo(
    @Query('referenceNo') referenceNo: string
  ): Promise<Booking[]> {
    const bookings = await this.searchService.getBookingsByReferenceNo({});

    return bookings;
  }

  @Get('trips')
  @Roles('Passenger', 'ShippingLineStaff', 'ShippingLineAdmin')
  async getTripsByReferenceNo(
    @Query('referenceNo') referenceNo: string
  ): Promise<Trip[]> {
    const trips = await this.searchService.getTripsByReferenceNo({
      where: { referenceNo },
    });

    return trips;
  }

  @Get('dashboard')
  @Roles(
    'ShippingLineScanner',
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'SuperAdmin'
  )
  async getDashboardTrips(
    @Query() pagination: PaginatedRequest,
    @Query('shippingLineId') shippingLineId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('srcPortId') srcPortId?: number,
    @Query('destPortId') destPortId?: number
  ): Promise<PaginatedResponse<DashboardTrips>> {
    return this.searchService.getDashboardTrips(
      pagination,
      shippingLineId,
      startDate,
      endDate,
      srcPortId,
      destPortId
    );
  }
}
