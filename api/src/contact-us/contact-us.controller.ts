import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { IContactUs } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('contact-us')
@ApiExcludeController()
export class ContactUsController {
  constructor(private contactUsService: ContactUsService) { }

  @Get()
  async getContactUs(): Promise<IContactUs[]> {
    return await this.contactUsService.getContactUs();
  }

  @Get(':shippingLineId')
  async getContactUsByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IContactUs> {
    return this.contactUsService.getContactUsByShippingLineId(shippingLineId);
  }

  @Post('save')
  async saveContactUs(
    @Body() contactUs: IContactUs
  ): Promise<IContactUs> {
    return this.contactUsService.saveContactUs(contactUs);
  }
}
