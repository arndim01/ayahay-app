import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IAccount, IDisbursement } from '@ayahay/models';
import { DisbursementMapper } from './disbursement.mapper';
import { Prisma } from '@prisma/client';
import {
  DisbursementsPerTeller,
  PaginatedRequest,
  PaginatedResponse,
  TripSearchByDateRange,
} from '@ayahay/http';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class DisbursementService {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly disbursementMapper: DisbursementMapper
  ) {}

  async getDisbursementsByTrip(
    tripId: number,
    loggedInAccount: IAccount,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<IDisbursement>> {
    const itemsPerPage = pagination.page ? 10 : undefined;
    const skip = pagination.page
      ? (pagination.page - 1) * itemsPerPage
      : undefined;

    const where: Prisma.DisbursementWhereInput = {
      tripId: Number(tripId),
      trip: {
        shippingLineId: loggedInAccount.shippingLineId,
      },
    };

    const disbursements = await this.prisma.disbursement.findMany({
      where,
      include: {
        createdByAccount: {
          select: {
            email: true,
          },
        },
      },
      take: itemsPerPage,
      skip,
      orderBy: {
        date: 'desc',
      },
    });

    const disbursementsCount = pagination.page
      ? await this.prisma.disbursement.count({
          where,
        })
      : -1;

    return {
      total: disbursementsCount,
      data: disbursements.map((disbursement) =>
        this.disbursementMapper.convertDisbursementToDto(disbursement)
      ),
    };
  }

  async getDisbursementsByAccount(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<DisbursementsPerTeller[]> {
    const disbursements = await this.prisma.disbursement.findMany({
      where: {
        createdByAccountId: loggedInAccount.id,
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        trip: {
          shippingLineId: loggedInAccount.shippingLineId,
        },
      },
      select: {
        amount: true,
        date: true,
        description: true,
        officialReceipt: true,
        paidTo: true,
        purpose: true,
        trip: {
          select: {
            id: true,
            srcPort: {
              select: {
                code: true,
              },
            },
            destPort: {
              select: {
                code: true,
              },
            },
            departureDate: true,
          },
        },
      },
    });

    return disbursements.map((disbursement) =>
      this.disbursementMapper.convertDisbursementToDisbursementsPerTeller(
        disbursement
      )
    );
  }

  async createDisbursements(
    disbursementData: Prisma.DisbursementCreateManyInput[],
    loggedInAccount: IAccount
  ): Promise<void> {
    const disbursementDataWithCreateInfo = disbursementData.map((data) => ({
      ...data,
      createdByAccountId: loggedInAccount.id,
      createdAt: new Date(),
    }));

    await this.prisma.disbursement.createMany({
      data: disbursementDataWithCreateInfo,
    });
  }

  async updateDisbursement(
    disbursementId: number,
    data: Prisma.DisbursementUpdateInput,
    loggedInAccount: IAccount
  ): Promise<void> {
    const disbursement = await this.prisma.disbursement.findUnique({
      where: { id: disbursementId },
      select: {
        trip: {
          select: {
            shippingLineId: true,
          },
        },
      },
    });

    this.verifyAccessToDisbursement(
      disbursement.trip.shippingLineId,
      loggedInAccount
    );

    await this.prisma.disbursement.update({
      where: { id: disbursementId },
      data,
    });
  }

  async deleteDisbursement(
    disbursementId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const disbursement = await this.prisma.disbursement.findUnique({
      where: { id: disbursementId },
      select: {
        trip: {
          select: {
            shippingLineId: true,
          },
        },
      },
    });

    this.verifyAccessToDisbursement(
      disbursement.trip.shippingLineId,
      loggedInAccount
    );

    await this.prisma.disbursement.delete({
      where: { id: disbursementId },
    });
  }

  private verifyAccessToDisbursement(
    shippingLineId: number,
    loggedInAccount: IAccount
  ): void {
    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      { shippingLineId },
      loggedInAccount
    );
  }
}
