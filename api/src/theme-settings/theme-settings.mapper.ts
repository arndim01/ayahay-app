import { Injectable } from '@nestjs/common';
import { ThemeSettings } from '@prisma/client';
import { IThemeSettings } from '@ayahay/models';

@Injectable()
export class ThemeSettingsMapper {
  constructor() {}

  convertContactUsToDto(themeSettings: ThemeSettings): IThemeSettings {
    return {
      ...themeSettings,
    };
  }
}
