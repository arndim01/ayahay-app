import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { ICabin } from '@ayahay/models';
import { CabinMapper } from './cabin.mapper';

@Injectable()
export class CabinService {
  constructor(
    private prisma: PrismaService,
    private readonly cabinMapper: CabinMapper
  ) {}

  async getCabinsByShip(shipId: number): Promise<ICabin[]> {
    const cabins = await this.prisma.cabin.findMany({ where: { shipId } });

    return cabins.map((cabin) => this.cabinMapper.convertCabinToDto(cabin));
  }
}
