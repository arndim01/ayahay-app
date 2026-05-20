import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { PressService } from './press.service';
import { IPress } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@Controller('press')
@ApiExcludeController()
export class PressController {
  constructor(private pressService: PressService) { }

  @Get()
  async getPress(): Promise<IPress[]> {
    return await this.pressService.getPress();
  }

  @Get(':shippingLineId')
  async getPressByShippingLineId(
    @Param('shippingLineId') shippingLineId: number
  ): Promise<IPress[]> {
    return this.pressService.getPressByShippingLineId(shippingLineId);
  }

  @Get('item/:id')
  async getPressById(
    @Param('id') id: number
  ): Promise<IPress> {
    return this.pressService.getPressById(id);
  }

  @Post()
  async createPress(
    @Body() data: Prisma.PressCreateInput
  ): Promise<IPress> {
    return await this.pressService.createPress(data);
  }

  @Put(':id')
  async updatePress(
    @Param('id') id: number, 
    @Body() data: Prisma.PressUpdateInput
  ): Promise<IPress> {
    return await this.pressService.updatePress(id, data);
  }

  @Delete(':id')
  async deletePress(
    @Param('id') id: number
  ): Promise<IPress> {
    return await this.pressService.deletePress(id);
  }
}