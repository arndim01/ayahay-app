import { Module } from '@nestjs/common';
import { FormPreferencesController } from './form-preferences.controller';
import { FormPreferencesService } from './form-preferences.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormPreferencesController],
  providers: [FormPreferencesService],
})
export class FormPreferencesModule {}
