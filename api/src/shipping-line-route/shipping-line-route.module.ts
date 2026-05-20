import { Module } from "@nestjs/common";
import { ShippingLineRouteService } from "./shipping-line-route.service";
import { ShippingLineRouteController } from "./shipping-line.controller";

@Module({
  providers: [ShippingLineRouteService],
  controllers: [ShippingLineRouteController],
  exports: [ShippingLineRouteService],
})
export class ShippingRouteModule {}
