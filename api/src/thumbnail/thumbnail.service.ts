import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IThumbnail } from '@ayahay/models';

@Injectable()
export class ThumbnailService {
  constructor(private readonly prisma: PrismaService) { }

  async getThumbnails(): Promise<IThumbnail[]> {
    return await this.prisma.thumbnail.findMany({});
  }

  async getThumbnailsByShippingLineId(
    location: string,
    shippingLineId: number
  ): Promise<IThumbnail[]> {
    const thumbnails = await this.prisma.thumbnail.findMany({
      where: {
        location: {
          equals: location,
          mode: "insensitive",
        },
        shippingLineId,
      },
      orderBy: {
        imageOrder: 'asc',
      },
    });

    return thumbnails;
  }

  async addThumbnail(thumbnail: IThumbnail): Promise<IThumbnail> {
    const { id, ...data } = thumbnail;
    return await this.prisma.thumbnail.create({ data });
  }

  async updateThumbnail(thumbnail: IThumbnail): Promise<IThumbnail> {
    const { id, ...data } = thumbnail;
    return await this.prisma.thumbnail.update({
      where: { id },
      data,
    });
  }

  async deleteThumbnail(id: number): Promise<IThumbnail> {
    return await this.prisma.thumbnail.delete({
      where: { id },
    });
  }
}  