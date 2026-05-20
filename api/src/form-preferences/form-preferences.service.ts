import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FormPreferencesService {
  constructor(private prisma: PrismaService) {}

  async getAllPorts(shippingLineId?: number) {
    if (shippingLineId) {
      return this.getPortsByShippingLine(shippingLineId);
    }

    return this.prisma.port.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  }

  async getPortsByShippingLine(shippingLineId: number) {
    if (!shippingLineId || isNaN(Number(shippingLineId))) {
      throw new BadRequestException('Valid shipping line ID is required');
    }

    const parsedShippingLineId = Number(shippingLineId);

    const shippingLinePorts = await this.prisma.shippingLinePort.findMany({
      where: {
        shippingLineId: parsedShippingLineId,
      },
      include: {
        port: true,
      },
    });

    return shippingLinePorts.map((slp) => ({
      id: slp.port.id,
      name: slp.port.name,
      code: slp.port.code,
    }));
  }

  async getPreferences(portId: number, shippingLineId: number) {
    if (!portId) {
      return null;
    }

    const preferences = await this.prisma.passengerInformation.findUnique({
      where: {
        shippingLineId_portId: {
          shippingLineId,
          portId,
        },
      },
      select: {
        shippingLineId: true,
        portId: true,
        data: true,
      },
    });

    if (!preferences) {
      return null;
    }

    return {
      shippingLineId: preferences.shippingLineId,
      portId: preferences.portId,
      data: preferences.data,
    };
  }

  async upsertPreferences(
    portId: number,
    shippingLineId: number,
    data: Prisma.JsonValue,
    userId: string
  ) {
    return this.prisma.passengerInformation.upsert({
      where: {
        shippingLineId_portId: {
          shippingLineId,
          portId,
        },
      },
      create: {
        portId,
        shippingLineId,
        data,
        createdBy: userId,
        updatedBy: userId,
      },
      update: {
        data,
        updatedBy: userId,
      },
    });
  }
}
