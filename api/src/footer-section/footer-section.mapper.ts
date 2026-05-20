import { Injectable } from '@nestjs/common';
import { FooterSection } from '@prisma/client';
import { IFooterSection } from '@ayahay/models';

@Injectable()
export class FooterSectionMapper {
  constructor() {}

  convertFooterSectionToDto(footerSection: FooterSection): IFooterSection {
    return {
      ...footerSection,
    };
  }
}
