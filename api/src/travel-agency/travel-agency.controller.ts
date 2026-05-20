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
import { TravelAgencyService } from './travel-agency.service';

@Controller('travel-agencys')
export class TravelAgencyController {
  constructor(private travelAgencyService: TravelAgencyService) {}
}
