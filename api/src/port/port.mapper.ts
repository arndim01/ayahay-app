import { Injectable } from '@nestjs/common';
import { Port } from '@prisma/client';
import { IPort } from '@ayahay/models';

@Injectable()
export class PortMapper {
  constructor() {}

  convertPortToDto(port: Port): IPort {
    return {
      ...port,
    };
  }
}
