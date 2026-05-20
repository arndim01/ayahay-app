import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CabinTypeService } from './cabin-type.service';
import { ICabinType } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('cabin-types')
@ApiExcludeController()
export class CabinTypeController {
  constructor(private cabinTypeService: CabinTypeService) {}

  @Get()
  async getCabinTypes(): Promise<ICabinType[]> {
    return await this.cabinTypeService.getCabinTypes();
  }
}
