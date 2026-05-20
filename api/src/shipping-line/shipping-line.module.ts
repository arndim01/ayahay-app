// shippingLine
import { Module } from '@nestjs/common';
import { ShippingLineController } from './shipping-line.controller';
import { ShippingLineService } from './shipping-line.service';

@Module({
  controllers: [ShippingLineController],
  providers: [ShippingLineService],
  exports: [ShippingLineService],
})
export class ShippingLineModule {}
