import { Injectable } from '@nestjs/common';
import { Press } from '@prisma/client';
import { IPress } from '@ayahay/models';

@Injectable()
export class PressMapper {
  constructor() {}

  convertPressToDto(press: Press): IPress {
    return {
      ...press,
    };
  }
}
