import { Controller, Get, Param, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { IPrivacyPolicy } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @Get()
  async getAll(): Promise<IPrivacyPolicy[]> {
    return this.privacyPolicyService.getAll();
  }

  @Get(':shippingLineId')
  async getByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IPrivacyPolicy[]> {
    return this.privacyPolicyService.getByShippingLineId(Number(shippingLineId));
  }

  @Get('section')
  async getByTitleIdAndShippingLineId(
    @Query('titleId') titleId: string,
    @Query('shippingLineId') shippingLineId: number
  ): Promise<IPrivacyPolicy | null> {
    return this.privacyPolicyService.getByTitleIdAndShippingLineId(titleId, Number(shippingLineId));
  }

  @Post()
  async create(
    @Body() data: Prisma.PrivacyPolicyCreateInput
  ): Promise<IPrivacyPolicy> {
    return this.privacyPolicyService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Prisma.PrivacyPolicyUpdateInput
  ): Promise<IPrivacyPolicy | null> {
    return this.privacyPolicyService.update(Number(id), data);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number
  ): Promise<IPrivacyPolicy | null> {
    return this.privacyPolicyService.delete(Number(id));
  }
}
