import { Controller, Get } from '@nestjs/common';
import { PortService } from './port.service';
import { IPort } from '@ayahay/models';
import { Port } from '../specs/trip.specs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Ports')
@Controller('ports')
export class PortController {
  constructor(private portService: PortService) {}

  @Get()
  @ApiOkResponse({
    description: 'The full list of ports in the Ayahay database.',
    type: [Port],
  })
  async getPorts(): Promise<IPort[]> {
    return await this.portService.getPorts();
  }
}
