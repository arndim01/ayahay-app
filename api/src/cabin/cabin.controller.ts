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
import { CabinService } from './cabin.service';

@Controller('cabins')
export class CabinController {
  constructor(private cabinService: CabinService) {}
}
