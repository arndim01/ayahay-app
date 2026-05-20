import { Module } from '@nestjs/common';
import { FooterSectionController } from './footer-section.controller';
import { FooterSectionService } from './footer-section.service';

@Module({
  controllers: [FooterSectionController],
  providers: [FooterSectionService],
})
export class FooterSectionModule {}
