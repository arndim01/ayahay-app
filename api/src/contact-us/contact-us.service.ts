import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IContactUs } from '@ayahay/models';

@Injectable()
export class ContactUsService {
  constructor(private readonly prisma: PrismaService) { }

  async getContactUs(): Promise<IContactUs[]> {
    return await this.prisma.contactUs.findMany({});
  }

  async getContactUsByShippingLineId(
    shippingLineId: number
  ): Promise<IContactUs | null> {
    const contactUs = await this.prisma.contactUs.findFirst({
      where: {
        shippingLineId,
      },
    });

    return contactUs;
  }

  async saveContactUs(contactUs: Partial<IContactUs>): Promise<IContactUs> {
    const existingContactUs = await this.prisma.contactUs.findFirst({
      where: { shippingLineId: contactUs.shippingLineId },
    });

    if (existingContactUs) {
      return this.prisma.contactUs.update({
        where: { id: existingContactUs.id },
        data: {
          ...existingContactUs,
          ...contactUs,
        },
      });
    }

    return this.prisma.contactUs.create({
      data: contactUs as IContactUs,
    });
  }
}