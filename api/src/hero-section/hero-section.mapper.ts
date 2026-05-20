import { Injectable } from '@nestjs/common';
import { HeroSection } from '@prisma/client';
import { IHeroSection } from '@ayahay/models';

@Injectable()
export class HeroSectionMapper {
  constructor() {}

  convertHeroSectionToDto(heroSection: HeroSection): IHeroSection {
    return {
      ...heroSection,
    };
  }
}
