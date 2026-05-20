import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IAccount, IWebhook } from '@ayahay/models';
import { AuthService } from '@/auth/auth.service';
import { WebhookMapper } from '@/webhook/webhook.mapper';
import { CryptoService } from '@/crypto/crypto.service';
import axios, { AxiosError } from 'axios';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly cryptoService: CryptoService,
    private readonly webhookMapper: WebhookMapper
  ) {}

  async getWebhooksByCompany(
    shippingLineId: number | undefined,
    travelAgencyId: number | undefined,
    loggedInAccount: IAccount
  ): Promise<IWebhook[]> {
    await this.verifyAccessToWebhook(
      { shippingLineId, travelAgencyId },
      loggedInAccount
    );
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        shippingLineId: shippingLineId ?? null,
        travelAgencyId: travelAgencyId ?? null,
      },
    });
    return webhooks.map(this.webhookMapper.convertWebhookToDto);
  }

  private async verifyAccessToWebhook(
    webhook: { shippingLineId?: number; travelAgencyId?: number },
    loggedInAccount
  ): Promise<void> {
    const { shippingLineId, travelAgencyId } = webhook;
    if (shippingLineId) {
      this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
        { shippingLineId },
        loggedInAccount
      );
    }
    if (travelAgencyId) {
      this.authService.verifyAccountHasAccessToTravelAgencyRestrictedEntity(
        { travelAgencyId },
        loggedInAccount
      );
    }
  }

  async registerWebhook(
    webhook: IWebhook,
    loggedInAccount: IAccount
  ): Promise<void> {
    this.verifyAccessToWebhook(webhook, loggedInAccount);
    const webhookEntity =
      this.webhookMapper.convertWebhookToEntityForCreation(webhook);
    await this.prisma.webhook.create(webhookEntity);
  }

  async updateWebhook(
    webhookId: number,
    url: string,
    loggedInAccount: IAccount
  ): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });
    this.verifyAccessToWebhook(webhook, loggedInAccount);
    this.validateWebhookUrl(url);

    await this.prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        url,
      },
    });
  }

  private validateWebhookUrl(url: string): void {
    try {
      const newUrl = new URL(url);
      if (newUrl.protocol === 'http:' || newUrl.protocol === 'https:') {
        throw new BadRequestException('Invalid URL');
      }
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }

  async deregisterWebhook(
    webhookId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });
    this.verifyAccessToWebhook(webhook, loggedInAccount);
    await this.prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });
  }

  async signRequestForWebhook(toSign: any): Promise<string> {
    const requestBodyBuf = Buffer.from(JSON.stringify(toSign));
    const signatureBuf = await this.cryptoService.signWithAyahay(
      requestBodyBuf
    );
    return signatureBuf.toString('base64');
  }

  async postWebhook({ url }: IWebhook, body: any): Promise<void> {
    try {
      const signatureBase64 = await this.signRequestForWebhook(body);
      await axios.post(url, body, {
        headers: {
          'ayahay-signature': signatureBase64,
        },
      });
    } catch (e) {
      const errorMessage = e instanceof AxiosError ? e.toJSON() : e;
      this.logger.error(`Error calling webhook at ${url}: ${errorMessage}`);
    }
  }
}
