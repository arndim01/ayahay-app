import { Controller, Get } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { IVehicleType } from '@ayahay/models';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('vehicle-types')
@ApiExcludeController()
export class VehicleTypeController {
  constructor(private vehicleTypeService: VehicleTypeService) {}

  @Get()
  async getVehicleTypes(): Promise<IVehicleType[]> {
    return await this.vehicleTypeService.getVehicleTypes();
  }
}
