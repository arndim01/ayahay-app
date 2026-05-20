import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete
} from '@nestjs/common';
import { ThumbnailService } from './thumbnail.service';
import { IThumbnail } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('thumbnails')
@ApiExcludeController()
export class ThumbnailController {
  constructor(private thumbnailService: ThumbnailService) { }

  @Get()
  async getThumbnails(): Promise<IThumbnail[]> {
    return await this.thumbnailService.getThumbnails();
  }

  @Get(':location/:shippingLineId')
  async getThumbnailByShippingLineId(
    @Param('location') location: string,
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IThumbnail[]> {
    return this.thumbnailService.getThumbnailsByShippingLineId(location, shippingLineId);
  }

  @Post()
  async addThumbnail(
    @Body() thumbnail: IThumbnail
  ): Promise<IThumbnail> {
    return await this.thumbnailService.addThumbnail(thumbnail);
  }

  @Put(':id')
  async updateThumbnail(
    @Param('id') id: number,
    @Body() thumbnail: IThumbnail
  ): Promise<IThumbnail> {
    return await this.thumbnailService.updateThumbnail(thumbnail);
  }

  @Delete(':id')
  async deleteThumbnail(
    @Param('id') id: number
  ): Promise<IThumbnail> {
    return this.thumbnailService.deleteThumbnail(id);
  }
}