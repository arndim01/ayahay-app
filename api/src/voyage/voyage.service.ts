import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoyageDto } from './voyage.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VoyageService {
  private readonly logger = new Logger(VoyageService.name);
  
  constructor(private prisma: PrismaService) {}

  async create(createVoyageDto: CreateVoyageDto) {
    try {
      // Parse the form data
      const voyageData = {
        ...createVoyageDto,
        date: new Date(createVoyageDto.date),
      };

      // Validate trip exists
      const trip = await this.prisma.trip.findUnique({
        where: { id: voyageData.tripId },
      });

      if (!trip) {
        throw new BadRequestException();
      }

      return await this.prisma.voyage.create({
        data: {
          shipId: voyageData.shipId,
          tripId: voyageData.tripId,
          number: voyageData.number,
          date: voyageData.date,
          remarks: voyageData.remarks,
        },
        include: {
          ship: true,
          trip: true,
        },
      });

    } catch (error) {
      this.logger.error(`Failed to create voyage: ${error.message}`);
      throw error;
    }
  }

  async findByTripId(tripId: number) {
    return await this.prisma.voyage.findFirst({
      where: { tripId },
      include: {
        ship: true,
        trip: true,
      },
    });
  }

  async update(tripId: number, data: any) {
    try {
      return await this.prisma.voyage.update({
        where: { tripId: tripId },
        data: {
          number: data.number,
          date: new Date(data.date),
          remarks: data.remarks,
          shipId: data.shipId
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update voyage: ${error.message}`);
      throw new BadRequestException('Failed to update voyage');
    }
  }
}
