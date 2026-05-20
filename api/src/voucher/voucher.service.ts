import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { IAccount, IVoucher } from '@ayahay/models';
import { UtilityService } from '@/utility.service';
import { VoucherMapper } from './voucher.mapper';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';

@Injectable()
export class VoucherService {
  constructor(
    private prisma: PrismaService,
    private utilityService: UtilityService,
    private voucherMapper: VoucherMapper
  ) {}

  async getVouchersCreatedByLoggedInAccount(
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<IVoucher>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.VoucherWhereInput =
      loggedInAccount.role === 'SuperAdmin'
        ? undefined
        : {
            createdByAccountId: loggedInAccount.id,
          };
    const pagedVouchers = await this.prisma.voucher.findMany({
      where,
      orderBy: {
        code: 'asc',
      },
      take: itemsPerPage,
      skip,
    });

    const voucherCount = await this.prisma.voucher.count({
      where,
    });

    return {
      total: voucherCount,
      data: pagedVouchers.map((voucher) =>
        this.voucherMapper.convertVoucherToDto(voucher)
      ),
    };
  }

  async createVoucher(
    voucher: IVoucher,
    loggedInAccount: IAccount
  ): Promise<void> {
    if (!(voucher.code?.length > 0)) {
      voucher.code = this.utilityService.generateRandomAlphanumericString(8);
    }

    voucher.createdByAccountId = loggedInAccount.id;
    voucher.remainingUses = voucher.numberOfUses;

    const voucherEntity =
      this.voucherMapper.convertVoucherToEntityForCreation(voucher);

    try {
      await this.prisma.voucher.create(voucherEntity);
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
        throw e;
      }

      if (e.code === 'P2002') {
        throw new BadRequestException('Voucher code already exists');
      }

      throw e;
    }
  }

  async useVoucher(
    voucherCode?: string,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    if (voucherCode === undefined) {
      return;
    }

    // TODO: recheck voucher validity on booking payment
    await transactionContext.voucher.update({
      where: {
        code: voucherCode,
      },
      data: {
        remainingUses: {
          decrement: 1,
        },
      },
    });
  }
}
