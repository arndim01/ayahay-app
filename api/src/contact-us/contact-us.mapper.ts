import { Injectable } from '@nestjs/common';
import { ContactUs } from '@prisma/client';
import { IContactUs } from '@ayahay/models';

@Injectable()
export class ContactUsMapper {
  constructor() {}

  convertContactUsToDto(contactUs: ContactUs): IContactUs {
    return {
      ...contactUs,
    };
  }
}
