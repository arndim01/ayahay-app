import { Controller, Post, Body, Get, Put, Param, Logger, UseGuards, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { SecurityInterceptor } from '../common/interceptors/security.interceptor';
import { VoyageService } from './voyage.service';
import { CreateVoyageDto } from './voyage.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@UseInterceptors(SecurityInterceptor)
@ApiTags('Voyages')
@Controller('api/voyages')
export class VoyageController {
  private readonly logger = new Logger(VoyageController.name);
  
  constructor(private readonly voyageService: VoyageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new voyage' })
  async create(@Body() createVoyageDto: CreateVoyageDto) {
    try {
      // Log incoming data for debugging
      this.logger.debug(`Creating voyage with data: ${JSON.stringify(createVoyageDto)}`);
      
      // Validate and sanitize input
      const sanitizedData = this.sanitizeInput(createVoyageDto);
      
      const result = await this.voyageService.create(sanitizedData);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to create voyage: ${error.message}`);
      throw error;
    }
  }

  private sanitizeInput(data: any) {
    // Add input sanitization logic here
    return {
      ...data,
      number: parseInt(data.number),
      shipId: parseInt(data.shipId),
      tripId: parseInt(data.tripId),
      remarks: data.remarks?.trim()
    };
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get voyage by trip ID' })
  async findByTripId(@Param('tripId') tripId: string) {
    try {
      const result = await this.voyageService.findByTripId(+tripId);
      
      // Simply return null or an empty object if no voyage is found
      // This prevents throwing a NotFoundException which would log errors
      if (!result) {
        return null; // Return 200 OK with null instead of throwing 404
      }
      
      return result;
    } catch (error) {
      // Log the error but don't expose internal details
      this.logger.error(`Error fetching voyage for trip ID ${tripId}: ${error.message}`);
      
      // Return null instead of throwing an error
      return null;
    }
  }

  @Put(':tripId')
  @ApiOperation({ summary: 'Update voyage' })
  async update(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() updateVoyageDto: CreateVoyageDto
  ) {
    try {
      // Validate and transform the data
      const sanitizedData = {
        ...updateVoyageDto,
        tripId: Number(tripId),
        shipId: Number(updateVoyageDto.shipId),
        number: Number(updateVoyageDto.number)
      };

      const result = await this.voyageService.update(tripId, sanitizedData);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error updating voyage: ${error.message}`);
      throw error;
    }
  }
}
