import { Injectable } from '@nestjs/common';
import { AboutUs } from '@prisma/client';
import { IAboutUs } from '@ayahay/models';

@Injectable()
export class AboutUsMapper {
  constructor() {}

  convertAboutUsToDto(aboutUs: AboutUs): IAboutUs {
    return {
      ...aboutUs,
    };
  }
}
