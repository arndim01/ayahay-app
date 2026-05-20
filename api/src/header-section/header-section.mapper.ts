import { Injectable } from '@nestjs/common';
import { HeaderSection } from '@prisma/client';
import { IHeaderSection } from '@ayahay/models';

@Injectable()
export class HeaderSectionMapper {
  constructor() {}

  convertHeaderSectionToDto(headerSection: HeaderSection): IHeaderSection {
    return {
      ...headerSection,
    };
  }
}
