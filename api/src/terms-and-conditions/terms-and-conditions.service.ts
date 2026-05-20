import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { TermsAndConditions } from '@prisma/client';
import { CreateTermsAndConditionsDto, UpdateTermsAndConditionsDto } from './terms-and-conditions.dto';

@Injectable()
export class TermsAndConditionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTermsAndConditions(data: CreateTermsAndConditionsDto,): Promise<TermsAndConditions> {
    const existing = await this.prisma.termsAndConditions.findFirst({
      where: { shippingLineId: data.shippingLineId },
    });
    if (existing) {
      throw new BadRequestException('A Terms and Conditions record already exists for this shipping line.');
    }
    return this.prisma.termsAndConditions.create({ data });
  }

  async getAllTermsAndConditions(): Promise<TermsAndConditions[]> {
    return this.prisma.termsAndConditions.findMany();
  }

  // For getting Terms and Conditions of a specific Shipping Line at Admin View
  async getAdminShippingLineTermsAndConditions(shippingLineId: number,): Promise<TermsAndConditions | null> {
    return this.prisma.termsAndConditions.findFirst({
      where: {
        shippingLineId,
      },
    });
  }

  // For getting Terms and Conditions of a specific Shipping Line
  async getTermsAndConditionsForShippingLine(shippingLineId: number,): Promise<TermsAndConditions | null> {
    return this.prisma.termsAndConditions.findFirst({
      where: {
        shippingLineId,
        status: 'active',
      },
    });
  }

  async updateTermsAndConditions(id: number,data: UpdateTermsAndConditionsDto,): Promise<TermsAndConditions> {
    // If the shippingLineId is being updated, check for another record with the same shippingLineId.
    if (data.shippingLineId) {
      const conflictRecord = await this.prisma.termsAndConditions.findFirst({
        where: {
          shippingLineId: data.shippingLineId,
          id: { not: id },
        },
      });
      if (conflictRecord) {
        throw new BadRequestException(
          'A Terms and Conditions record already exists for this shipping line.'
        );
      }
    }
  
    return this.prisma.termsAndConditions.update({
      where: { id },
      data,
    });
  }

  async deleteTermsAndConditions(id: number): Promise<TermsAndConditions> {
    return this.prisma.termsAndConditions.delete({
      where: { id },
    });
  }
}
