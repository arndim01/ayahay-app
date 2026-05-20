import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { TripCancelEmailRequest } from '@ayahay/http';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { INotification } from '@ayahay/models';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private prisma: PrismaService) {}

  private readonly SES_CONFIG = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_SES_REGION,
  };

  private readonly sesClient = new SESClient(this.SES_CONFIG);

  async prepareTripCancelledEmail({
    tripId,
    reason,
  }: TripCancelEmailRequest): Promise<void> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      select: {
        departureDate: true,
        srcPort: {
          select: {
            name: true,
          },
        },
        destPort: {
          select: {
            name: true,
          },
        },
      },
    });

    const tripDetail = `${trip.srcPort.name} to ${
      trip.destPort.name
    } (${trip.departureDate.toLocaleString('en-US', {
      timeZone: 'Asia/Shanghai',
    })})`;

    const accounts = await this.prisma.account.findMany({
      where: {
        bookingsCreated: {
          some: {
            bookingTrips: {
              some: {
                tripId,
              },
            },
          },
        },
        role: 'Passenger',
        emailConsent: true,
      },
      select: {
        email: true,
      },
    });

    if (accounts.length === 0) {
      return;
    }

    const emails = accounts.map(({ email }) => email);

    await this.sendTripCancelledEmail({
      recipients: emails,
      subject: tripDetail,
      reason,
    });
  }

  private async sendTripCancelledEmail({
    recipients,
    subject,
    reason,
  }: any): Promise<void> {
    let params = {
      Source: process.env.AWS_SES_SENDER,
      Destination: {
        ToAddresses: recipients,
      },
      ReplyToAddresses: [],
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject + ' is CANCELLED',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<h1>Trip Cancelled</h1><br><p>To all passengers who booked a trip from ${subject}, your trip is unfortunately <strong>cancelled</strong> due to ${reason}. You may re-book again at <a href='${process.env.WEB_URL}'>ayahay.com</a>.</p><br><p>Thank you!</p><br><p>If you wish to unsubscribe from our subscription list, you may click <a href='${process.env.WEB_URL}/account/unsubscribe'>here</a></p>`,
          },
        },
      },
    };

    try {
      const sendEmailCommand = new SendEmailCommand(params);
      await this.sesClient.send(sendEmailCommand);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async sendBookingConfirmedEmail({
    recipient,
    bookingId,
  }: any): Promise<void> {
    let params = {
      Source: `Ayahay Booking <${process.env.AWS_SES_SENDER}>`,
      Destination: {
        ToAddresses: [recipient],
        BccAddresses: [process.env.AYAHAY_BCC_EMAIL],
      },
      ReplyToAddresses: [],
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Ayahay booking CONFIRMED',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<h1>Booking Confirmed</h1><br><p>Dear passenger, your booking (${bookingId}) and payment was a <strong>success</strong>! You may click the link to view your <a href='${process.env.WEB_URL}/booking/confirmed/${bookingId}'>booking summary</a>.</p><br><p>Have a safe trip! Kay ang pagsakay dapat, ayahay!</p><br><p>If you wish to unsubscribe from our subscription list, you may click <a href='${process.env.WEB_URL}/account/unsubscribe'>here</a></p>`,
          },
        },
      },
    };

    try {
      const sendEmailCommand = new SendEmailCommand(params);
      await this.sesClient.send(sendEmailCommand);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async sendNotificationsEmail(
    notification: INotification,
    accountIds: string[]
  ): Promise<void> {
    const accountEmailsWithConsent = await this.prisma.account.findMany({
      where: {
        id: {
          in: accountIds,
        },
        emailConsent: true,
      },
      select: {
        email: true,
      },
    });

    const emails = accountEmailsWithConsent.map(({ email }) => email);

    let params = {
      Source: process.env.AWS_SES_SENDER,
      Destination: {
        ToAddresses: emails,
      },
      ReplyToAddresses: [],
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: notification.subject,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<h1>New update</h1><br><p>${notification.body}</p><br><p>If you wish to unsubscribe from our subscription list, you may click <a href='${process.env.WEB_URL}/account/unsubscribe'>here</a></p>`,
          },
        },
      },
    };

    try {
      const sendEmailCommand = new SendEmailCommand(params);
      await this.sesClient.send(sendEmailCommand);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
