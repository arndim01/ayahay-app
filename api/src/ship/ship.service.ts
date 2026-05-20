import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IAccount, IShip, IVoyage } from '@ayahay/models';
import { ShipMapper } from './ship.mapper';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class ShipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly shipMapper: ShipMapper
  ) {}

  async getShips(): Promise<IShip[]> {
    return await this.prisma.ship.findMany();
  }

  async getShipsOfShippingLine(shippingLineId: number): Promise<IShip[]> {
    return await this.prisma.ship.findMany({
      where: {
        shippingLineId,
      },
    });
  }

  async getShipsOfMyShippingLine(loggedInAccount: IAccount): Promise<IShip[]> {
    const ships =
      loggedInAccount.role === 'SuperAdmin'
        ? await this.prisma.ship.findMany()
        : await this.prisma.ship.findMany({
            where: {
              shippingLineId: loggedInAccount.shippingLineId,
            },
          });

    return ships.map((ship) => this.shipMapper.convertShipToDto(ship));
  }

  async updateCargoRequired(id: number, cargoRequired: boolean): Promise<IShip> {
    const ship = await this.prisma.ship.update({
      where: { id },
      data: { cargoRequired },
      include: {
        cabins: {
          include: {
            cabinType: true
          }
        }
      }
    });
  
    return this.shipMapper.convertShipToDto(ship);
  }

  async createVoyageForTrip(
    trip: any,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;
    const tripDate = trip.departureDate.toLocaleString('en-US', {
      timeZone: 'Asia/Shanghai',
    });

    await transactionContext.voyage.create({
      data: {
        shipId: trip.shipId,
        tripId: trip.id,
        number: await this.getNextVoyageNumber(trip.shipId),
        date: new Date(),
        remarks: `${trip.srcPort?.code} -> ${trip.destPort?.code} ${tripDate}`,
      },
    });
  }

  private async getNextVoyageNumber(shipId: number): Promise<number> {
    const mostRecentVoyage = await this.prisma.voyage.findFirst({
      where: {
        shipId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (mostRecentVoyage === null) {
      return 1;
    }

    const mostRecentDryDock = await this.prisma.dryDock.findFirst({
      where: {
        shipId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (mostRecentDryDock === null) {
      return mostRecentVoyage.number + 1;
    }

    if (mostRecentVoyage.date < mostRecentDryDock.date) {
      // we reset voyage number to 1 after maintenance
      return 1;
    }

    return mostRecentVoyage.number + 1;
  }

  async createManualVoyage(
    shipId: number,
    remarks: string,
    loggedInAccount: IAccount,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    await this.verifyLoggedInUserShippingLineOwnsShip(
      shipId,
      loggedInAccount,
      transactionContext
    );

    await transactionContext.voyage.create({
      data: {
        shipId,
        number: await this.getNextVoyageNumber(shipId),
        date: new Date(),
        remarks,
      },
    });
  }

  async verifyLoggedInUserShippingLineOwnsShip(
    shipId: number,
    loggedInAccount: IAccount,
    transactionContext: PrismaClient
  ): Promise<void> {
    const ship = await transactionContext.ship.findUnique({
      where: {
        id: shipId,
      },
    });

    if (ship === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      ship,
      loggedInAccount
    );
  }

  async createDryDock(
    shipId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    await this.verifyLoggedInUserShippingLineOwnsShip(
      shipId,
      loggedInAccount,
      this.prisma
    );

    await this.prisma.dryDock.create({
      data: {
        shipId,
        date: new Date(),
      },
    });
  }

  async getVoyages(
    shipId: number,
    afterLastMaintenance: boolean,
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<IVoyage>> {
    await this.verifyLoggedInUserShippingLineOwnsShip(
      shipId,
      loggedInAccount,
      this.prisma
    );
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const mostRecentDryDock = await this.prisma.dryDock.findFirst({
      where: {
        shipId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // if never started dry dock, show no voyages before last maintenance
    if (mostRecentDryDock === null && !afterLastMaintenance) {
      return {
        total: 0,
        data: [],
      };
    }

    const where: Prisma.VoyageWhereInput =
      mostRecentDryDock === null
        ? {
            shipId,
          }
        : {
            shipId,
            date: afterLastMaintenance
              ? {
                  gt: mostRecentDryDock.date,
                }
              : {
                  lt: mostRecentDryDock.date,
                },
          };
    const voyages = await this.prisma.voyage.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: itemsPerPage,
      skip,
    });

    const voyageTotalCount = await this.prisma.voyage.count({
      where,
    });

    return {
      total: voyageTotalCount,
      data: voyages.map((voyage) => this.shipMapper.convertVoyageToDto(voyage)),
    };
  }

  async getDryDocks(
    shipId: number,
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ) {
    await this.verifyLoggedInUserShippingLineOwnsShip(
      shipId,
      loggedInAccount,
      this.prisma
    );
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const dryDocks = await this.prisma.dryDock.findMany({
      where: { shipId },
      orderBy: {
        date: 'desc',
      },
      take: itemsPerPage,
      skip,
    });

    const dryDockTotalCount = await this.prisma.dryDock.count({
      where: { shipId },
    });

    return {
      total: dryDockTotalCount,
      data: dryDocks.map((dryDock) =>
        this.shipMapper.convertDryDockToDto(dryDock)
      ),
    };
  }

  async findByShippingLineId(shippingLineId: number): Promise<IShip[]> {
    const ships = await this.prisma.ship.findMany({
      where: {
        shippingLineId,
      },
      include: {
        cabins: {
          include: {
            cabinType: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (!ships.length) {
      throw new NotFoundException(`No ships found for shipping line ${shippingLineId}`);
    }

    return ships;
  }
}
