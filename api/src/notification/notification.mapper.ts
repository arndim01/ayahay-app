import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { INotification } from '@ayahay/models';

@Injectable()
export class NotificationMapper {
  constructor() {}

  convertNotificationToDto(notification: any): INotification {
    return {
      id: notification.id,
      tripId: notification.tripId,

      subject: notification.subject,
      body: notification.body,
      dateCreatedIso: notification.dateCreated.toISOString(),
    };
  }

  convertNotificationToEntityForCreation(
    notification: INotification,
    accountIdsToNotify: string[]
  ): Prisma.NotificationCreateInput {
    const accountNotificationEntities: Prisma.AccountNotificationCreateManyNotificationInput[] =
      accountIdsToNotify.map((accountId) => ({
        accountId,
        isRead: false,
      })) ?? [];

    return {
      subject: notification.subject,
      body: notification.body,
      dateCreated: new Date().toISOString(),
      accountNotifications: {
        createMany: {
          data: accountNotificationEntities,
        },
      },
    };
  }
}
