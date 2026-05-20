import { Module } from '@nestjs/common';
import { HeroSectionController } from './hero-section.controller';
import { HeroSectionService } from './hero-section.service';

@Module({
  controllers: [HeroSectionController],
  providers: [HeroSectionService],
})
export class HeroSectionModule {}
