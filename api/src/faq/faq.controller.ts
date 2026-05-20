import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { FaqService } from './faq.service';
import { IFaq } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@Controller('faq')
@ApiExcludeController()
export class FaqController {
  constructor(private faqService: FaqService) { }

  @Get()
  async getFaqs(): Promise<IFaq[]> {
    return await this.faqService.getFaqs();
  }

  @Get(':shippingLineId')
  async getFaqsByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IFaq[]> {
    return this.faqService.getFaqsByShippingLineId(shippingLineId);
  }

  @Get(':category/:shippingLineId')
  async getFaqsByCategoryAndShippingLineId(
    @Param('category') category: string,
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IFaq[]> {
    return this.faqService.getFaqsByCategoryAndShippingLineId(category, shippingLineId);
  }

  @Post()
  async createFaq(
    @Body() data: Prisma.FaqCreateInput
  ): Promise<IFaq> {
    return await this.faqService.createFaq(data);
  }

  @Put(':id')
  async updateFaq(
    @Param('id') id: number, 
    @Body() data: Prisma.FaqUpdateInput
  ): Promise<IFaq> {
    return await this.faqService.updateFaq(id, data);
  }

  @Delete(':id')
  async deleteFaq(
    @Param('id') id: number
  ): Promise<IFaq> {
    return await this.faqService.deleteFaq(id);
  }
}
