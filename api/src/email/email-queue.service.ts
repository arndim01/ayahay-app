import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Prisma } from '@prisma/client';
import { IEmailQueue } from '@ayahay/models';

@Injectable()
export class EmailQueueService {
  constructor(private readonly prisma: PrismaService) {}

  async addEmailToQueue(data: Prisma.EmailQueueUncheckedCreateInput) {
    return await this.prisma.emailQueue.create({
      data,
    });
  }
  
}