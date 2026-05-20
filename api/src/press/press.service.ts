import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IPress } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class PressService {
  constructor(private readonly prisma: PrismaService) {}

  async getPress(): Promise<IPress[]> {
    return await this.prisma.press.findMany();
  }

  async getPressByShippingLineId(
    shippingLineId: number
  ): Promise<IPress[] | null> {
    return this.prisma.press.findMany({
      where: {
        shippingLineId,
      },
    });
  }

  async getPressById(
    id: number
  ): Promise<IPress | null> {
    return this.prisma.press.findFirst({
      where: {
        id,
      },
    });
  }

  async createPress(
    data: Prisma.PressCreateInput
  ): Promise<IPress> {
    return await this.prisma.press.create({
      data,
    });
  }

  async updatePress(
    id: number, 
    data: Prisma.PressUpdateInput
  ): Promise<IPress | null> {
    return await this.prisma.press.update({
      where: { id },
      data,
    });
  }

  async deletePress(
    id: number
  ): Promise<IPress | null> {
    return await this.prisma.press.delete({
      where: { id },
    });
  }
}