// port
import { Module } from '@nestjs/common';
import { PortController } from './port.controller';
import { PortService } from './port.service';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [PortController],
  providers: [PortService],
})
export class PortModule {}
