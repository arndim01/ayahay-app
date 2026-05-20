import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IRateTableRow } from '@ayahay/models';
import { PrismaService } from '@/prisma.service';
import { RateTableRowMapper } from '@/rate-table-row/rate-table-row.mapper';

@Injectable()
export class RateTableRowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateTableRowMapper: RateTableRowMapper
  ) {}

  async getRateTableRowsByRateTableId(rateTableId: number): Promise<IRateTableRow[]> {
    const rateTableRows = await this.prisma.rateTableRow.findMany({
      where: {
        rateTableId: rateTableId,
        canBookOnline: true
      },
      include: {
        cabin: { 
          select: {
            name: true,
          },
        },
        vehicleType: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });
  
    if (rateTableRows.length === 0) {
      throw new NotFoundException('No rate table rows found for this rateTableId');
    }
  
    // Map the Prisma results to the DTO format
    return rateTableRows.map(rateTableRow => this.rateTableRowMapper.convertRateTableRowToDto(rateTableRow));
  }  
}
