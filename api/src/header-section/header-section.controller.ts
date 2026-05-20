import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HeaderSectionService } from './header-section.service';
import { IHeaderSection } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('header-section')
@ApiExcludeController()
export class HeaderSectionController {
  constructor(private headerSectionService: HeaderSectionService) { }

  @Get()
  async getHeaderSections(): Promise<IHeaderSection[]> {
    return await this.headerSectionService.getHeaderSections();
  }

  @Get(':shippingLineId')
  async getHeaderSectionByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IHeaderSection> {
    return this.headerSectionService.getHeaderSectionByShippingLineId(shippingLineId);
  }

  @Post('save')
  async saveHeaderSection(
    @Body() headerSection: IHeaderSection
  ): Promise<IHeaderSection> {
    return this.headerSectionService.saveHeaderSection(headerSection);
  }
}
