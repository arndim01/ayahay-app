import {
  Request,
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { IPassenger } from '@ayahay/models';
import { AuthGuard } from '@/auth/auth.guard';
import { AllowUnverified } from '@/decorator/verified.decorator';
import { Roles } from '@/decorator/roles.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('passengers')
@UseGuards(AuthGuard)
@ApiExcludeController()
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @Get(':passengerId')
  @Roles('Passenger')
  async getPassenger(
    @Param('passengerId') passengerId: number
  ): Promise<IPassenger> {
    return await this.passengerService.getPassenger(passengerId);
  }

  @Post()
  @AllowUnverified()
  async createPassengerForLoggedInAccount(
    @Request() req,
    @Body() passenger: IPassenger
  ): Promise<IPassenger> {
    passenger.account = req.user;
    return await this.passengerService.createPassenger(passenger);
  }
}
