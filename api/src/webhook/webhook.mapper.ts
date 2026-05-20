import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IWebhook } from '@ayahay/models';

@Injectable()
export class WebhookMapper {
  convertWebhookToDto(webhook: any): IWebhook {
    return {
      id: webhook.id,
      shippingLineId: webhook.shippingLineId ?? undefined,
      travelAgencyId: webhook.travelAgencyId ?? undefined,
      type: webhook.type,
      url: webhook.url,
    };
  }

  convertWebhookToEntityForCreation(
    webhook: IWebhook
  ): Prisma.WebhookCreateArgs {
    return {
      data: {
        shippingLineId: webhook.shippingLineId ?? null,
        travelAgencyId: webhook.travelAgencyId ?? null,
        type: webhook.type,
        url: webhook.url,
      },
    };
  }
}
