import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IPort } from '@ayahay/models';

@Injectable()
export class PortService {
  constructor(private readonly prisma: PrismaService) {}

  async getPorts(): Promise<IPort[]> {
    return await this.prisma.port.findMany({});
  }
}
