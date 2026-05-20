import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IPrivacyPolicy } from '@ayahay/models';
import { Prisma, PrivacyPolicy as PrismaPrivacyPolicy } from '@prisma/client';
import { PrivacyPolicyMapper } from './privacy-policy.mapper';

const TITLE_ORDER = [
  'introduction',
  'information-we-collect',
  'how-we-use-your-information',
  'sharing-your-information',
  'security',
  'your-choices',
  'childrens-privacy',
  'updates-to-policy',
  'contact-us',
];

@Injectable()
export class PrivacyPolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: PrivacyPolicyMapper
  ) {}

  async getAll(): Promise<IPrivacyPolicy[]> {
    const raw = await this.prisma.privacyPolicy.findMany();
    return raw.map(this.mapper.convertPrivacyPolicyToDto);
  }

  async getByShippingLineId(shippingLineId: number): Promise<IPrivacyPolicy[]> {
    const raw = await this.prisma.privacyPolicy.findMany({
      where: { shippingLineId },
    });
  
    const sorted = raw.sort(
      (a, b) =>
        TITLE_ORDER.indexOf(a.titleId) - TITLE_ORDER.indexOf(b.titleId)
    );
  
    return sorted.map(this.mapper.convertPrivacyPolicyToDto);
  }

  async getByTitleIdAndShippingLineId(
    titleId: string,
    shippingLineId: number
  ): Promise<IPrivacyPolicy | null> {
    const raw = await this.prisma.privacyPolicy.findFirst({
      where: { titleId, shippingLineId },
    });
    return raw ? this.mapper.convertPrivacyPolicyToDto(raw) : null;
  }

  async create(
    data: Prisma.PrivacyPolicyCreateInput
  ): Promise<IPrivacyPolicy> {
    const created = await this.prisma.privacyPolicy.create({ data });
    return this.mapper.convertPrivacyPolicyToDto(created);
  }

  async update(
    id: number,
    data: Prisma.PrivacyPolicyUpdateInput
  ): Promise<IPrivacyPolicy | null> {
    const updated = await this.prisma.privacyPolicy.update({
      where: { id },
      data,
    });
    return updated ? this.mapper.convertPrivacyPolicyToDto(updated) : null;
  }

  async delete(id: number): Promise<IPrivacyPolicy | null> {
    const deleted = await this.prisma.privacyPolicy.delete({
      where: { id },
    });
    return deleted ? this.mapper.convertPrivacyPolicyToDto(deleted) : null;
  }
}
