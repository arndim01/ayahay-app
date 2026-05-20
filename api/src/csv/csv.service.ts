import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class CsvService {
  constructor(private prisma: PrismaService) {}
}
