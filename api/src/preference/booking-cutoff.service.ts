import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingCutoffDto, UpdateBookingCutoffDto } from './dto/booking-cutoff.dto';
import { BookingCutoffPrismaService } from './prisma/booking-cutoff.prisma.service';

@Injectable()
export class BookingCutoffService {
  constructor(private prisma: BookingCutoffPrismaService) {}

  async create(data: CreateBookingCutoffDto) {
    try {
      return await this.prisma.createBookingCutoff({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error) {
      throw new Error(`Failed to create booking cutoff: ${error.message}`);
    }
  }

  async findAll() {
    return await this.prisma.findAllBookingCutoffs();
  }

  async findOne(id: number) {
    const cutoff = await this.prisma.findBookingCutoffById(id);
    if (!cutoff) throw new NotFoundException(`Booking cutoff #${id} not found`);
    return cutoff;
  }

  async update(id: number, data: UpdateBookingCutoffDto) {
    try {
      return await this.prisma.updateBookingCutoff(id, {
        ...data,
        updated_at: new Date(),
      });
    } catch (error) {
      throw new NotFoundException(`Booking cutoff #${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.deleteBookingCutoff(id);
    } catch (error) {
      throw new NotFoundException(`Booking cutoff #${id} not found`);
    }
  }
}
