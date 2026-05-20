import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FooterSectionService } from './footer-section.service';
import { IFooterSection } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('footer-section')
@ApiExcludeController()
export class FooterSectionController {
  constructor(private footerSectionService: FooterSectionService) { }

  @Get()
  async getFooterSections(): Promise<IFooterSection[]> {
    return await this.footerSectionService.getFooterSections();
  }

  @Get(':shippingLineId')
  async getFooterSectionByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IFooterSection> {
    return this.footerSectionService.getFooterSectionByShippingLineId(shippingLineId);
  }

  @Post('save')
  async saveFooterSection(
    @Body() footerSection: IFooterSection
  ): Promise<IFooterSection> {
    return this.footerSectionService.saveFooterSection(footerSection);
  }
}
