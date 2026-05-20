import { Module } from '@nestjs/common';
import { BookingCutoffController } from './booking-cutoff.controller';
import { BookingCutoffService } from './booking-cutoff.service';
import { BookingCutoffPrismaService } from './prisma/booking-cutoff.prisma.service';

@Module({
  controllers: [BookingCutoffController],
  providers: [BookingCutoffService, BookingCutoffPrismaService],
  exports: [BookingCutoffService],
})
export class BookingCutoffModule {}
