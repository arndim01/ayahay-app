import { Module } from '@nestjs/common';
import { HeaderSectionController } from './header-section.controller';
import { HeaderSectionService } from './header-section.service';

@Module({
  controllers: [HeaderSectionController],
  providers: [HeaderSectionService],
})
export class HeaderSectionModule {}
