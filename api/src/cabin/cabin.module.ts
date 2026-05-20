// cabin
import { Module } from '@nestjs/common';
import { CabinController } from './cabin.controller';
import { CabinService } from './cabin.service';

@Module({
  controllers: [CabinController],
  providers: [CabinService],
  exports: [CabinService],
})
export class CabinModule {}
