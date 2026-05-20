import {
  Controller,
  Request,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { IWebhook } from '@ayahay/models';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('webhooks')
@UseGuards(AuthGuard)
@Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'SuperAdmin')
@ApiExcludeController()
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Get()
  async getWebhooks(
    @Request() req,
    @Query('shippingLineId') shippingLineId?: number,
    @Query('travelAgencyId') travelAgencyId?: number
  ): Promise<IWebhook[]> {
    return this.webhookService.getWebhooksByCompany(
      shippingLineId,
      travelAgencyId,
      req.user
    );
  }

  @Post()
  async registerWebhook(
    @Request() req,
    @Body() webhook: IWebhook
  ): Promise<void> {
    return this.webhookService.registerWebhook(webhook, req.user);
  }

  @Put(':webhookId')
  async updateWebhook(
    @Request() req,
    @Param('webhookId') webhookId: number,
    @Body('url') url: string
  ): Promise<void> {
    return this.webhookService.updateWebhook(webhookId, url, req.user);
  }

  @Delete(':webhookId')
  async deregisterWebhook(
    @Request() req,
    @Param('webhookId') webhookId: number
  ): Promise<void> {
    return this.webhookService.deregisterWebhook(webhookId, req.user);
  }
}
