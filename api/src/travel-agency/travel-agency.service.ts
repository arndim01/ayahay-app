import { Injectable } from '@nestjs/common';
import { TravelAgency, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TravelAgencyService {
  constructor(private prisma: PrismaService) {}
}
