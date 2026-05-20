import { Injectable } from '@nestjs/common';
import { IPassenger } from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { SEX, CIVIL_STATUS } from '@ayahay/constants/enum';

@Injectable()
export class PassengerMapper {
  convertPassengerToDto(passenger: any, withBuddies?: boolean): IPassenger {
    if (!passenger) {
      return undefined;
    }

    return {
      id: passenger.id,
      buddyId: passenger.buddyId,

      firstName: passenger.firstName,
      lastName: passenger.lastName,
      occupation: passenger.occupation,
      sex: passenger.sex,
      civilStatus: passenger.civilStatus,
      birthdayIso: passenger.birthday ? passenger.birthday.toISOString() : null,
      address: passenger.address,
      nationality: passenger.nationality,
      discountType: passenger.discountType ?? undefined,

      companions: withBuddies
        ? passenger.buddies?.map((companion) =>
            this.convertPassengerToDto(companion, false)
          )
        : [],
    };
  }

  convertPassengerToEntityForCreation(
    passenger: IPassenger
  ): Prisma.PassengerCreateInput {
    // Validate and parse the birthday
    let birthday: Date | null = null;
    if (passenger.birthdayIso) {
      try {
        birthday = new Date(passenger.birthdayIso);
        // Check if the date is valid
        if (isNaN(birthday.getTime())) {
          birthday = null;
        }
      } catch (e) {
        birthday = null;
      }
    }

    return {
      firstName: passenger.firstName || '',
      lastName: passenger.lastName || '',
      occupation: passenger.occupation || '',
      sex: passenger.sex || '',
      civilStatus: passenger.civilStatus || '',
      birthday: birthday,
      address: passenger.address || '',
      nationality: passenger.nationality || '',
      discountType: passenger.discountType,
      account: passenger.account
        ? {
            connect: {
              id: passenger.account.id,
            },
          }
        : undefined,
      buddy: passenger.buddyId
        ? {
            connect: {
              id: passenger.buddyId,
            },
          }
        : undefined,
    } as Prisma.PassengerCreateInput;
  }
}
