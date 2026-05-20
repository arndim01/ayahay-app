import { Module } from '@nestjs/common';
import { VoyageController } from './voyage.controller';
import { VoyageService } from './voyage.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VoyageController],
  providers: [VoyageService],
})
export class VoyageModule {}
