import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IThemeSettings } from '@ayahay/models';

@Injectable()
export class ThemeSettingsService {
  constructor(private readonly prisma: PrismaService) { }

  async getThemeSettings(): Promise<IThemeSettings[]> {
    return await this.prisma.themeSettings.findMany({});
  }

  async getThemeSettingsByShippingLineId(
    shippingLineId: number
  ): Promise<IThemeSettings | null> {
    const themeSettings = await this.prisma.themeSettings.findFirst({
      where: {
        shippingLineId,
      },
    });

    return themeSettings;
  }

  async saveThemeSettings(themeSettings: Partial<IThemeSettings>): Promise<IThemeSettings> {
    const existingThemeSettings = await this.prisma.themeSettings.findFirst({
      where: { shippingLineId: themeSettings.shippingLineId },
    });

    if (existingThemeSettings) {
      return this.prisma.themeSettings.update({
        where: { id: existingThemeSettings.id },
        data: {
          ...existingThemeSettings,
          ...themeSettings,
        },
      });
    }

    return this.prisma.themeSettings.create({
      data: themeSettings as IThemeSettings,
    });
  }
}