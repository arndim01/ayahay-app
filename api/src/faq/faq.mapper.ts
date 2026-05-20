import { Injectable } from '@nestjs/common';
import { Faq } from '@prisma/client';
import { IFaq } from '@ayahay/models';

@Injectable()
export class FaqMapper {
  constructor() {}

  convertFaqToDto(faq: Faq): IFaq {
    return {
      ...faq,
    };
  }
}
