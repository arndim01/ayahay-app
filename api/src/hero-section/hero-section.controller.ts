import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HeroSectionService } from './hero-section.service';
import { IHeroSection } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('hero-section')
@ApiExcludeController()
export class HeroSectionController {
  constructor(private heroSectionService: HeroSectionService) { }

  @Get()
  async getHeroSections(): Promise<IHeroSection[]> {
    return await this.heroSectionService.getHeroSections();
  }

  @Get(':shippingLineId')
  async getHeroSectionByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IHeroSection> {
    return this.heroSectionService.getHeroSectionByShippingLineId(shippingLineId);
  }

  @Post('save')
  async saveHeroSection(
    @Body() heroSection: IHeroSection
  ): Promise<IHeroSection> {
    return this.heroSectionService.saveHeroSection(heroSection);
  }
}
