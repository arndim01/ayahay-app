import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IHeroSection } from '@ayahay/models';

@Injectable()
export class HeroSectionService {
  constructor(private readonly prisma: PrismaService) { }

  async getHeroSections(): Promise<IHeroSection[]> {
    return await this.prisma.heroSection.findMany({});
  }

  async getHeroSectionByShippingLineId(
    shippingLineId: number
  ): Promise<IHeroSection | null> {
    const heroSection = await this.prisma.heroSection.findFirst({
      where: {
        shippingLineId,
      },
    });

    return heroSection;
  }

  async saveHeroSection(heroSection: Partial<IHeroSection>): Promise<IHeroSection> {
    const existingHeroSection = await this.prisma.heroSection.findFirst({
      where: { shippingLineId: heroSection.shippingLineId },
    });

    if (existingHeroSection) {
      return this.prisma.heroSection.update({
        where: { id: existingHeroSection.id },
        data: {
          ...existingHeroSection,
          ...heroSection,
        },
      });
    }

    return this.prisma.heroSection.create({
      data: heroSection as IHeroSection,
    });
  }
}
