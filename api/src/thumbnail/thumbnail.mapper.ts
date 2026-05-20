import { Injectable } from '@nestjs/common';
import { Thumbnail } from '@prisma/client';
import { IThumbnail } from '@ayahay/models';

@Injectable()
export class ThumbnailMapper {
  constructor() {}

  convertThumbnailToDto(thumbnail: Thumbnail): IThumbnail {
    return {
      ...thumbnail,
    };
  }
}
