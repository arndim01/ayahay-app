import { Module } from '@nestjs/common';
import { CabinTypeController } from './cabin-type.controller';
import { CabinTypeService } from './cabin-type.service';

@Module({
  controllers: [CabinTypeController],
  providers: [CabinTypeService],
})
export class CabinTypeModule {}
