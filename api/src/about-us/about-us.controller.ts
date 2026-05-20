import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AboutUsService } from './about-us.service';
import { IAboutUs } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('about-us')
@ApiExcludeController()
export class AboutUsController {
  constructor(private aboutUsService: AboutUsService) {}

  @Get()
  async getAboutUs(): Promise<IAboutUs[]> {
    return await this.aboutUsService.getAboutUs();
  }

  @Get(':shippingLineId')
  async getAboutUsByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IAboutUs> {
    return this.aboutUsService.getAboutUsByShippingLineId(shippingLineId);
  }

  @Post('save')
  async saveAboutUs(
    @Body() aboutUs: IAboutUs
  ): Promise<IAboutUs> {
    return this.aboutUsService.saveAboutUs(aboutUs);
  }
}
