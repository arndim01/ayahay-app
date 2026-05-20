import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IAboutUs } from '@ayahay/models';

@Injectable()
export class AboutUsService {
  constructor(private readonly prisma: PrismaService) { }

  async getAboutUs(): Promise<IAboutUs[]> {
    return await this.prisma.aboutUs.findMany({});
  }

  async getAboutUsByShippingLineId(
    shippingLineId: number
  ): Promise<IAboutUs | null> {
    const aboutUs = await this.prisma.aboutUs.findFirst({
      where: {
        shippingLineId,
      },
    });

    return aboutUs;
  }

  async saveAboutUs(aboutUs: Partial<IAboutUs>): Promise<IAboutUs> {
    const existingAboutUs = await this.prisma.aboutUs.findFirst({
      where: { shippingLineId: aboutUs.shippingLineId },
    });

    if (existingAboutUs) {
      return this.prisma.aboutUs.update({
        where: { id: existingAboutUs.id },
        data: {
          ...existingAboutUs,
          ...aboutUs,
        },
      });
    }

    return this.prisma.aboutUs.create({
      data: aboutUs as IAboutUs,
    });
  }
}
