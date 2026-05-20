import {
  Request,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseArrayPipe,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { IPort, ITrip } from '@ayahay/models';
import { TripMapper } from './trip.mapper';
import { Roles } from '@/decorator/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import {
  CancelledTrips,
  CollectOption,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  SearchAvailableTrips,
  UpdateTripCapacityRequest,
  VehicleBookings,
} from '@ayahay/http';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetTripsQuery, Trip } from '@/specs/trip.specs';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

class TripOverrideDto {
  @IsNotEmpty()
  departureDateIso: string;

  @IsNotEmpty()
  srcPortId: number;

  @IsNotEmpty()
  destPortId: number;

  @IsNotEmpty()
  shipId: number;

  shippingLineId?: number;
  rateTableId?: number;
}

class ScheduleDto {
  @IsNotEmpty()
  scheduleId: number;

  @ValidateNested()
  @Type(() => TripOverrideDto)
  override: TripOverrideDto;

  repeatDays?: string[];
}

class DateRangeDto {
  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  endDate: string;
}

class CreateTripsFromSchedulesDto implements CreateTripsFromSchedulesRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules: ScheduleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DateRangeDto)
  dateRanges: DateRangeDto[];
}

@ApiTags('Trips')
@Controller('trips')
@ApiBearerAuth()
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripMapper: TripMapper
  ) {}

  @Get()
  @ApiExcludeEndpoint()
  async getTrips(
    @Query('tripIds', new ParseArrayPipe({ items: Number })) tripIds: number[]
  ): Promise<ITrip[]> {
    return this.tripService.getTripsByIds(tripIds);
  }

  @Get('destination-ports')
  @ApiExcludeEndpoint()
  async getTripsDestinationByPortId(
    @Query('portId', ParseIntPipe) portId: number,
    @Query('shippingLineId', new DefaultValuePipe(null), ParseIntPipe)
    shippingLineId: number | null
  ): Promise<IPort[]> {
    return this.tripService.getTripsDestinationByPortId(portId, shippingLineId);
  }

  @Get('available')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiQuery({ type: GetTripsQuery })
  @ApiOkResponse({
    description: 'The list of available trips that matches the query.',
    type: [Trip],
  })
  async getAvailableTrips(
    @Query() pagination: PaginatedRequest,
    @Query() searchQuery: SearchAvailableTrips,
    @Request() req
  ): Promise<PaginatedResponse<ITrip>> {
    return await this.tripService.getAvailableTrips(
      pagination,
      searchQuery,
      req.user
    );
  }

  @Get('available-trips')
  // @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  // @ApiQuery({ type: GetTripsQuery })
  @ApiOkResponse({
    description: 'The list of available trips that matches the query.',
    type: [Trip],
  })
  async getAvailableTripsV2(
    @Query() pagination: PaginatedRequest,
    @Query() searchQuery: SearchAvailableTrips,
    @Request() req
  ): Promise<PaginatedResponse<ITrip>> {
    return await this.tripService.getAvailableTripsV2(
      pagination,
      searchQuery,
      req.user
    );
  }

  @Get(':tripId')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getTripById(
    @Param('tripId') tripId: string,
    @Request() req
  ): Promise<ITrip> {
    const trip = await this.tripService.getTrip(
      req.user,
      { id: Number(tripId) },
      {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        voyage: true,
      }
    );

    return this.tripMapper.convertTripToDto(trip);
  }

  @Get('schedule-and-fares')
  async getScheduleAndFares(
    @Query('departureDateISO') departureDateISO?: string, 
    @Query('shippingLineId') shippingLineId?: number
  ): Promise<ITrip[]> {
    return this.tripService.getScheduleAndFares(departureDateISO, shippingLineId);
  }

  @Get('available-by-date-range')
  @UseGuards(AuthGuard)
  @Roles(
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'TravelAgencyStaff',
    'TravelAgencyAdmin',
    'SuperAdmin'
  )
  @ApiExcludeEndpoint()
  async getAvailableTripsByDateRange(
    @Query() pagination: PaginatedRequest,
    @Query('shippingLineId') shippingLineId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('srcPortId') srcPortId?: number,
    @Query('destPortId') destPortId?: number
  ): Promise<PaginatedResponse<ITrip>> {
    return await this.tripService.getAvailableTripsByDateRange(
      pagination,
      shippingLineId,
      startDate,
      endDate,
      srcPortId,
      destPortId
    );
  }

  @Get('collect')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getTripsForCollectBooking(
    @Query() query: PortsAndDateRangeSearch,
    @Request() req
  ): Promise<CollectOption[]> {
    return await this.tripService.getTripsForCollectBooking(query, req.user);
  }

  @Get('cancelled-trips')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getCancelledTrips(
    @Query() pagination: PaginatedRequest,
    @Query('shippingLineId') shippingLineId: number,
    @Query() query: PortsAndDateRangeSearch,
    @Request() req
  ): Promise<PaginatedResponse<CancelledTrips>> {
    return this.tripService.getCancelledTrips(
      pagination,
      shippingLineId,
      query,
      req.user
    );
  }

  @Get(':tripId/vehicle-bookings')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getVehicleBookingsOfTrip(
    @Query() pagination: PaginatedRequest,
    @Param('tripId') tripId: number,
    @Request() req
  ): Promise<PaginatedResponse<VehicleBookings>> {
    return this.tripService.getVehicleBookingsOfTrip(
      pagination,
      tripId,
      req.user
    );
  }

  @Post('validate')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async validateTripsFromSchedules(
    @Body() createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest,
    @Request() req
  ): Promise<{
    valid: boolean;
    errors?: { scheduleId: number; message: string }[];
  }> {
    return this.tripService.validateTripsFromSchedules(
      createTripsFromSchedulesRequest,
      req.user
    );
  }

  @Post('from-schedules')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async createTripsFromSchedules(
    @Body() createTripsFromSchedulesRequest: CreateTripsFromSchedulesDto,
    @Request() req
  ): Promise<void> {
    try {
      console.log(
        'Controller received request:',
        JSON.stringify(createTripsFromSchedulesRequest, null, 2)
      );
      return await this.tripService.createTripsFromSchedules(
        createTripsFromSchedulesRequest,
        req.user
      );
    } catch (error) {
      console.error('Error in createTripsFromSchedules controller:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'An error occurred during trip creation'
      );
    }
  }

  @Patch(':tripId/capacity')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async updateTripCabinCapacity(
    @Param('tripId') tripId: number,
    @Body() updateTripCapacityRequest: UpdateTripCapacityRequest,
    @Request() req
  ): Promise<void> {
    return await this.tripService.updateTripCapacities(
      tripId,
      updateTripCapacityRequest,
      req.user
    );
  }

  @Patch(':tripId/cancel')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async cancelTrip(
    @Param('tripId') tripId: number,
    @Body('reason') reason: string,
    @Request() req
  ): Promise<void> {
    return this.tripService.cancelTrip(tripId, reason, req.user);
  }

  @Patch(':tripId/arrived')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async setTripAsArrived(
    @Param('tripId') tripId: number,
    @Request() req
  ): Promise<void> {
    return this.tripService.setTripAsArrived(tripId, req.user);
  }

  @Patch(':tripId/online-booking')
  @UseGuards(AuthGuard)
  @Roles('SuperAdmin')
  @ApiExcludeEndpoint()
  async updateTripOnlineBooking(
    @Param('tripId') tripId: number,
    @Body('allowOnlineBooking') allowOnlineBooking: boolean,
    @Request() req
  ): Promise<void> {
    return this.tripService.updateTripOnlineBooking(
      tripId,
      allowOnlineBooking,
      req.user
    );
  }

  @Patch(':tripId/ship/:shipId/rateTable/:rateTableId')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async updateTripVessel(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('shipId', ParseIntPipe) shipId: number,
    @Param('rateTableId', ParseIntPipe) rateTableId: number,
    @Request() req
  ): Promise<void> {
    try {
      if (!tripId || !shipId || !rateTableId) {
        throw new BadRequestException('Missing required parameters');
      }

      await this.tripService.updateTripVessel(
        tripId,
        shipId,
        rateTableId,
        req.user
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An error occurred while updating the vessel'
      );
    }
  }

  @Get('ship/:shipId/shipping-line/:shippingLineId')
  @ApiExcludeEndpoint()
  async getTripShip(
    @Param('shipId', ParseIntPipe) shipId: number,
    @Param('shippingLineId', ParseIntPipe) shippingLineId: number
  ) {
    try {
      const ship = await this.tripService.getTripShip(shipId, shippingLineId);
      return ship;
    } catch (error) {
      throw error;
    }
  }

  @Get('ship/:shipId/rate-table')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async getRateTableForShip(@Param('shipId', ParseIntPipe) shipId: number) {
    try {
      const rateTable = await this.tripService.getRateTableForShip(shipId);
      return { rateTableId: rateTable.id };
    } catch (error) {
      console.error('Error getting rate table:', error);
      throw error;
    }
  }
}
