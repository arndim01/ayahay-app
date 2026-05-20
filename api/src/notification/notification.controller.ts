import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { PaginatedRequest } from '@ayahay/http';
import { INotification } from '@ayahay/models';
import { Roles } from '@/decorator/roles.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('notifications')
@ApiExcludeController()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('mine')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async getMyNotifications(
    @Request() req,
    @Query() pagination: PaginatedRequest
  ): Promise<INotification[]> {
    return this.notificationService.getMyNotifications(
      pagination,
      req.user?.id
    );
  }

  @Post('public')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async createAnnouncement(@Body() notification: INotification): Promise<void> {
    return this.notificationService.createAnnouncement(notification);
  }
}
