import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import {
  TripReport,
  TripManifest,
  TripSearchByDateRange,
  PortsByShip,
  PerVesselReport,
  BillOfLading,
  PaginatedRequest,
  VoidBookings,
  PaginatedResponse,
  CollectTripBooking,
  SalesPerTellerReport,
} from '@ayahay/http';
import { BookingService } from '@/booking/booking.service';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('reporting')
@ApiExcludeController()
export class ReportingController {
  constructor(
    private reportingService: ReportingService,
    private bookingService: BookingService
  ) {}

  @Get('trips/:id/reporting')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getTripsReporting(
    @Param('id') tripId: string,
    @Request() req
  ): Promise<TripReport> {
    return this.reportingService.getTripsReporting(Number(tripId), req.user);
  }

  @Get('ports')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getPortsByShip(
    @Query() dates: TripSearchByDateRange,
    @Request() req
  ): Promise<PortsByShip[]> {
    return this.reportingService.getPortsByShip(dates, req.user);
  }

  @Get('trips/ships')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getTripsByShip(
    @Query() data: PortsByShip,
    @Request() req
  ): Promise<PerVesselReport[]> {
    return this.reportingService.getTripsByShip(data, req.user);
  }

  @Get('sales-per-teller')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getSalesPerTeller(
    @Query() data: TripSearchByDateRange,
    @Request() req
  ): Promise<SalesPerTellerReport> {
    return this.reportingService.getSalesPerTeller(data, req.user);
  }

  @Get('trips/:id/manifest')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getTripManifest(
    @Param('id') tripId: string,
    @Query('onboarded') onboarded: boolean,
    @Request() req
  ): Promise<TripManifest> {
    return this.reportingService.getTripManifest(
      Number(tripId),
      onboarded,
      req.user
    );
  }

  @Get(':id/bol')
  async getBillOfLading(@Param('id') bookingId: string): Promise<BillOfLading> {
    return this.reportingService.getBillOfLading(bookingId);
  }

  @Get('trips/:tripId/void/booking/passenger')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getVoidBookingTripPassengers(
    @Query() pagination: PaginatedRequest,
    @Param('tripId') tripId: string,
    @Request() req
  ): Promise<PaginatedResponse<VoidBookings>> {
    return this.reportingService.getVoidBookingTripPassengers(
      pagination,
      Number(tripId),
      req.user
    );
  }

  @Get('trips/:tripId/void/booking/vehicle')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getVoidBookingTripVehicles(
    @Query() pagination: PaginatedRequest,
    @Param('tripId') tripId: string,
    @Request() req
  ): Promise<PaginatedResponse<VoidBookings>> {
    return this.reportingService.getVoidBookingTripVehicles(
      pagination,
      Number(tripId),
      req.user
    );
  }

  @Get('trip/booking/collect')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getCollectTripBookings(
    @Query('tripIds', new ParseArrayPipe({ items: Number })) tripIds: number[],
    @Request() req
  ): Promise<CollectTripBooking[]> {
    return this.reportingService.getCollectTripBookings(tripIds, req.user);
  }

  @Patch(':bookingId/bol/frr')
  async updateBookingFRR(
    @Param('bookingId') bookingId: string,
    @Body('frr') frr: string
  ): Promise<void> {
    return this.bookingService.updateBookingFRR(bookingId, frr);
  }
}
