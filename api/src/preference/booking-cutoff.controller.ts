import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BookingCutoffService } from './booking-cutoff.service';
import { CreateBookingCutoffDto, UpdateBookingCutoffDto } from './dto/booking-cutoff.dto';
import { AuthGuard } from '../auth/auth.guard'; 
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Booking Cutoff')
@Controller('preference/booking-cutoff')
@UseGuards(AuthGuard) 
export class BookingCutoffController {
  constructor(private readonly service: BookingCutoffService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking cutoff' })
  async create(@Body() createDto: CreateBookingCutoffDto) {
    return await this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all booking cutoffs' })
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking cutoff by id' })
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a booking cutoff' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateBookingCutoffDto) {
    return await this.service.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking cutoff' })
  async remove(@Param('id') id: string) {
    return await this.service.remove(+id);
  }
}
