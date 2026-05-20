import { Injectable } from '@nestjs/common';
import { IAccount } from '@ayahay/models';
import { ACCOUNT_ROLE } from '@ayahay/constants';
import { PassengerMapper } from '@/passenger/passenger.mapper';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { Prisma } from '@prisma/client';
import { TravelAgencyMapper } from '@/travel-agency/travel-agency.mapper';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';

@Injectable()
export class AccountMapper {
  constructor(
    private readonly passengerMapper: PassengerMapper,
    private readonly vehicleMapper: VehicleMapper,
    private readonly travelAgencyMapper: TravelAgencyMapper,
    private readonly shippingLineMapper: ShippingLineMapper
  ) {}

  convertAccountToDto(account: any): IAccount {
    if (!account) {
      return undefined;
    }

    return {
      id: account.id,
      email: account.email,
      emailConsent: account.emailConsent,
      passengerId: account.passengerId ?? undefined,
      passenger: this.passengerMapper.convertPassengerToDto(
        account.passenger,
        true
      ),
      role: account.role as ACCOUNT_ROLE,
      shippingLineId: account.shippingLineId ?? undefined,
      shippingLine: this.shippingLineMapper.convertShippingLineToSimpleDto(
        account.shippingLine
      ),
      travelAgencyId: account.travelAgencyId ?? undefined,
      travelAgency: this.travelAgencyMapper.convertTravelAgencyToDto(
        account.travelAgency
      ),
      clientId: account.clientId ?? undefined,
      vehicles: account.vehicles?.map((vehicle) =>
        this.vehicleMapper.convertVehicleToDto(vehicle)
      ),
    };
  }

  convertAccountToEntityForCreation(
    account: IAccount
  ): Prisma.AccountCreateInput {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      passenger: {
        create: account.passenger
          ? this.passengerMapper.convertPassengerToEntityForCreation(
              account.passenger
            )
          : undefined,
      },
    };
  }
}
