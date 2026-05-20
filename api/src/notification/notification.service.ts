import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { INotification } from '@ayahay/models';
import { PaginatedRequest } from '@ayahay/http';
import { NotificationMapper } from './notification.mapper';
import { EmailService } from '@/email/email.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationMapper: NotificationMapper
  ) {}

  async getMyNotifications(
    pagination: PaginatedRequest,
    loggedInAccountId?: string
  ): Promise<INotification[]> {
    const query = this.getNotificationQuery(pagination, loggedInAccountId);
    const notificationEntities = await this.prisma.notification.findMany(query);
    return notificationEntities.map((notificationEntity) =>
      this.notificationMapper.convertNotificationToDto(notificationEntity)
    );
  }

  private getNotificationQuery(
    pagination: PaginatedRequest,
    loggedInAccountId?: string
  ): any {
    const itemsPerPage = 5;
    const skip = (pagination.page - 1) * itemsPerPage;

    if (loggedInAccountId === undefined) {
      // TODO: get notifications that has no account notifications
      return {
        orderBy: {
          dateCreated: 'desc',
        },
        take: itemsPerPage,
        skip,
      };
    }

    return {
      where: {
        accountNotifications: {
          some: { accountId: loggedInAccountId },
        },
      },
      include: {
        accountNotifications: {
          where: {
            accountId: loggedInAccountId,
          },
        },
      },
      orderBy: {
        dateCreated: 'desc',
      },
      take: itemsPerPage,
      skip,
    };
  }

  async createAnnouncement(notification: INotification): Promise<void> {
    const allAccounts = await this.prisma.account.findMany({
      select: {
        id: true,
      },
    });
    const allAccountIds = allAccounts.map((account) => account.id);
    const notificationEntity =
      this.notificationMapper.convertNotificationToEntityForCreation(
        notification,
        allAccountIds
      );

    await this.prisma.notification.create({ data: notificationEntity });

    this.emailService.sendNotificationsEmail(notification, allAccountIds);
  }
}
