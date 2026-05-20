import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { ICabinType } from '@ayahay/models';

@Injectable()
export class CabinTypeService {
  constructor(private prisma: PrismaService) {}

  async getCabinTypes(): Promise<ICabinType[]> {
    return await this.prisma.cabinType.findMany({});
  }
}
