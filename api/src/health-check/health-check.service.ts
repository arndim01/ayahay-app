import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthCheckService {
  constructor(private prisma: PrismaService) {}

  async isHealthy() {
    return await this.prisma.$queryRaw`SELECT 1`;
  }
}
