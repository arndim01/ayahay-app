import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { IAccount, IPassenger } from '@ayahay/models';
import { AuthGuard } from '@/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { Roles } from '@/decorator/roles.decorator';
import { AllowUnverified } from '@/decorator/verified.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('accounts')
@UseGuards(AuthGuard)
@ApiExcludeController()
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('mine')
  @AllowUnverified()
  async getMyAccountInformation(@Request() req): Promise<IAccount> {
    return this.accountService.getMyAccountInformation(req.user, req.token);
  }

  @Get(':accountId')
  @Roles(
    'Passenger',
    'ShippingLineScanner',
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'SuperAdmin'
  )
  async getAccount(@Param('accountId') accountId: string): Promise<IAccount> {
    return await this.accountService.getAccountById(accountId);
  }

  @Post()
  @Roles('Passenger', 'SuperAdmin')
  async createAccount(
    @Body() data: Prisma.AccountCreateInput
  ): Promise<IAccount> {
    return await this.accountService.createAccount(data);
  }

  @Post('passengers')
  @AllowUnverified()
  async createPassengerAccount(
    @Request() req,
    @Body() passenger: IPassenger
  ): Promise<void> {
    return this.accountService.createPassengerAccount(req.user, passenger);
  }

  @Get('mine/api-key')
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'SuperAdmin')
  async getMyApiKey(@Request() req): Promise<string> {
    return this.accountService.getMyApiKey(req.user);
  }

  @Post('mine/api-key')
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'SuperAdmin')
  async generateApiKeyForAccount(@Request() req): Promise<string> {
    return this.accountService.generateApiKeyForAccount(req.user);
  }

  @Post('unsubscribe')
  @Roles('Passenger', 'SuperAdmin')
  async unsubscribeEmail(@Request() req): Promise<void> {
    return await this.accountService.unsubscribeEmail(req.user);
  }

  @Patch()
  @Roles('Passenger')
  async updateAccount(@Request() req, @Body() data: any): Promise<void> {
    return await this.accountService.updateAccount(req.user, data);
  }
}
