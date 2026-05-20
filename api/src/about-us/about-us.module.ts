import { Module } from '@nestjs/common';
import { AboutUsController } from './about-us.controller';
import { AboutUsService } from './about-us.service';

@Module({
  controllers: [AboutUsController],
  providers: [AboutUsService],
})
export class AboutUsModule {}
