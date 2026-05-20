import {
  Request,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { IVoucher } from '@ayahay/models';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('vouchers')
@ApiExcludeController()
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async getVouchers(
    @Query() pagination: PaginatedRequest,
    @Request() req
  ): Promise<PaginatedResponse<IVoucher>> {
    return this.voucherService.getVouchersCreatedByLoggedInAccount(
      pagination,
      req.user
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async createVoucher(
    @Body() voucher: IVoucher,
    @Request() req
  ): Promise<void> {
    return this.voucherService.createVoucher(voucher, req.user);
  }
}
