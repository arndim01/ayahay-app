import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IHeaderSection } from '@ayahay/models';

@Injectable()
export class HeaderSectionService {
  constructor(private readonly prisma: PrismaService) { }

  async getHeaderSections(): Promise<IHeaderSection[]> {
    return await this.prisma.headerSection.findMany({});
  }

  async getHeaderSectionByShippingLineId(
    shippingLineId: number
  ): Promise<IHeaderSection | null> {
    const headerSection = await this.prisma.headerSection.findFirst({
      where: {
        shippingLineId,
      },
    });

    return headerSection;
  }

  async saveHeaderSection(headerSection: Partial<IHeaderSection>): Promise<IHeaderSection> {
    const existingHeaderSection = await this.prisma.headerSection.findFirst({
      where: { shippingLineId: headerSection.shippingLineId },
    });

    if (existingHeaderSection) {
      return this.prisma.headerSection.update({
        where: { id: existingHeaderSection.id },
        data: {
          ...existingHeaderSection,
          ...headerSection,
        },
      });
    }

    return this.prisma.headerSection.create({
      data: headerSection as IHeaderSection,
    });
  }
}
