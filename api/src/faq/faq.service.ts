import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IFaq } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) { }

  async getFaqs(): Promise<IFaq[]> {
    return await this.prisma.faq.findMany();
  }

  async getFaqsByShippingLineId(
    shippingLineId: number
  ): Promise<IFaq[]> {
    return this.prisma.faq.findMany({
      where: {
        shippingLineId,
      },
    });
  }

  async getFaqsByCategoryAndShippingLineId(
    category: string,
    shippingLineId: number
  ): Promise<IFaq[]> {
    return this.prisma.faq.findMany({
      where: {
        category,
        shippingLineId,
      },
    });
  }

  async createFaq(
    data: Prisma.FaqCreateInput
  ): Promise<IFaq> {
    return await this.prisma.faq.create({
      data,
    });
  }

  async updateFaq(
    id: number,
    data: Prisma.FaqUpdateInput
  ): Promise<IFaq | null> {
    return await this.prisma.faq.update({
      where: { id },
      data,
    });
  }

  async deleteFaq(
    id: number
  ): Promise<IFaq | null> {
    return await this.prisma.faq.delete({
      where: { id },
    });
  }
}