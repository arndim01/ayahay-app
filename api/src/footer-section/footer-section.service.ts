import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IFooterSection } from '@ayahay/models';

@Injectable()
export class FooterSectionService {
  constructor(private readonly prisma: PrismaService) { }

  async getFooterSections(): Promise<IFooterSection[]> {
    return await this.prisma.footerSection.findMany({});
  }

  async getFooterSectionByShippingLineId(
    shippingLineId: number
  ): Promise<IFooterSection | null> {
    const footerSection = await this.prisma.footerSection.findFirst({
      where: {
        shippingLineId,
      },
    });

    return footerSection;
  }

  async saveFooterSection(footerSection: Partial<IFooterSection>): Promise<IFooterSection> {
    const existingFooterSection = await this.prisma.footerSection.findFirst({
      where: { shippingLineId: footerSection.shippingLineId },
    });

    if (existingFooterSection) {
      return this.prisma.footerSection.update({
        where: { id: existingFooterSection.id },
        data: {
          ...existingFooterSection,
          ...footerSection,
        },
      });
    }

    return this.prisma.footerSection.create({
      data: footerSection as IFooterSection,
    });
  }
}
