import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IVehicleType } from '@ayahay/models';

@Injectable()
export class VehicleTypeService {
  constructor(private prisma: PrismaService) {}

  async getVehicleTypes(): Promise<IVehicleType[]> {
    return await this.prisma.vehicleType.findMany({});
  }
}
