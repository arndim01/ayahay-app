import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ThemeSettingsService } from './theme-settings.service';
import { IThemeSettings } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('theme-settings')
@ApiExcludeController()
export class ThemeSettingsController {
  constructor(private themeSettingsService: ThemeSettingsService) { }

  @Get()
  async getThemeSettings(): Promise<IThemeSettings[]> {
    return await this.themeSettingsService.getThemeSettings();
  }

  @Get(':shippingLineId')
  async getThemeSettingsByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IThemeSettings> {
    return this.themeSettingsService.getThemeSettingsByShippingLineId(shippingLineId);
  }

  @Post('save')
  async saveThemeSettings(
    @Body() themeSettings: IThemeSettings
  ): Promise<IThemeSettings> {
    return this.themeSettingsService.saveThemeSettings(themeSettings);
  }
}
