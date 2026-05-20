import { Injectable } from '@nestjs/common';
import { WebhookService } from '../webhook/webhook.service';
import { IBooking, IWebhook } from '@ayahay/models';
import { WEBHOOK_TYPE } from '@ayahay/constants';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class BookingWebhookService {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly prisma: PrismaService
  ) {}

  async notifyBookingCreateWebhooks(booking: IBooking): Promise<void> {
    const webhookType: keyof typeof WEBHOOK_TYPE = 'BOOKING_CREATE';
    // get webhooks of shipping line AND travel agencies partnered with said shipping line
    const webhooksToNotify = await this.prisma.$queryRaw<IWebhook[]>`
      SELECT w.*
      FROM ayahay.webhook w
      LEFT JOIN ayahay.travel_agency_shipping_line t ON w.travel_agency_id IS NOT NULL AND w.travel_agency_id = t.travel_agency_id
      WHERE (w.shipping_line_id = ${booking.shippingLineId} OR t.shipping_line_id = ${booking.shippingLineId}) 
        AND w."type" = ${webhookType};
    `;
    webhooksToNotify.forEach((webhook) =>
      this.webhookService.postWebhook(webhook, booking)
    );
  }
}
