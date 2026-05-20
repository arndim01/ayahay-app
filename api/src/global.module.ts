import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UtilityService } from './utility.service';
import { MapperModule } from './mapper.module';
import { CryptoModule } from '@/crypto/crypto.module';
import { AuthModule } from '@/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule, CryptoModule, MapperModule],
  providers: [PrismaService, UtilityService],
  exports: [
    AuthModule,
    CryptoModule,
    MapperModule,
    PrismaService,
    UtilityService,
  ],
})
export class GlobalModule {}
