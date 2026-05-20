import { Module } from '@nestjs/common';
import { ThemeSettingsController } from './theme-settings.controller';
import { ThemeSettingsService } from './theme-settings.service';

@Module({
  controllers: [ThemeSettingsController],
  providers: [ThemeSettingsService],
})
export class ThemeSettingsModule {}
