import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IVehicle, IVehicleType } from '@ayahay/models';

@Injectable()
export class VehicleMapper {
  constructor() {}

  convertVehicleToDto(vehicle: any): IVehicle {
    return {
      id: vehicle.id,
      accountId: vehicle.accountId,
      vehicleTypeId: vehicle.vehicleTypeId,
      vehicleType: vehicle.vehicleType
        ? this.convertVehicleTypeToDto(vehicle.vehicleType)
        : undefined,
      plateNo: vehicle.plateNo,
      modelName: vehicle.modelName,
      modelYear: vehicle.modelYear,
      officialReceiptUrl: vehicle.officialReceiptUrl,
      certificateOfRegistrationUrl: vehicle.certificateOfRegistrationUrl,
    };
  }

  convertVehicleTypeToDto(vehicleType: any): IVehicleType {
    return {
      id: vehicleType.id,
      name: vehicleType.name,
      description: vehicleType.description,
    };
  }

  convertVehicleToEntityForCreation(
    vehicle: IVehicle
  ): Prisma.VehicleCreateInput {
    return {
      plateNo: vehicle.plateNo,
      modelName: vehicle.modelName,
      modelYear: vehicle.modelYear,
      officialReceiptUrl: vehicle.officialReceiptUrl,
      certificateOfRegistrationUrl: vehicle.certificateOfRegistrationUrl,
      account: vehicle.accountId
        ? {
            connect: {
              id: vehicle.accountId,
            },
          }
        : undefined,
      vehicleType: {
        connect: {
          id: vehicle.vehicleTypeId,
        },
      },
    } as Prisma.VehicleCreateInput;
  }
}
