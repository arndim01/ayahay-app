import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IDisbursement } from '@ayahay/models';
import { DisbursementService } from './disbursement.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { Prisma } from '@prisma/client';
import { ApiExcludeController } from '@nestjs/swagger';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';

@Controller('disbursement')
@UseGuards(AuthGuard)
@ApiExcludeController()
export class DisbursementController {
  constructor(private disbursementService: DisbursementService) {}

  @Get()
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getDisbursementsByTrip(
    @Query('tripId') tripId: number,
    @Request() req,
    @Query() pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<IDisbursement>> {
    return this.disbursementService.getDisbursementsByTrip(
      tripId,
      req.user,
      pagination
    );
  }

  @Post()
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async createDisbursements(
    @Body() data: Prisma.DisbursementCreateManyInput[],
    @Request() req
  ): Promise<void> {
    return this.disbursementService.createDisbursements(data, req.user);
  }

  @Patch(':disbursementId')
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async updateDisbursement(
    @Param('disbursementId') disbursementId: number,
    @Body() data: Prisma.DisbursementUpdateInput,
    @Request() req
  ): Promise<void> {
    return this.disbursementService.updateDisbursement(
      disbursementId,
      data,
      req.user
    );
  }

  @Delete(':disbursementId')
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async deleteDisbursement(
    @Param('disbursementId') disbursementId: number,
    @Request() req
  ): Promise<void> {
    return this.disbursementService.deleteDisbursement(
      disbursementId,
      req.user
    );
  }
}
