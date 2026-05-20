import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FormPreferencesService } from './form-preferences.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { Roles } from '@/decorator/roles.decorator';

interface UpsertPreferenceDto {
  portId: number;
  shippingLineId?: number;
  preferences: {
    field: string;
    enabled: boolean;
    defaultValue?: string;
  }[];
}

interface RequestWithUser extends Request {
  user: {
    id: string;
    shippingLineId?: number;
    portId?: number;
    role?: string;
  };
}

const DEFAULT_PREFERENCES = [
  { field: 'firstName', enabled: true },
  { field: 'lastName', enabled: true },
  { field: 'sex', enabled: true, defaultValue: '' },
  { field: 'dateOfBirth', enabled: true },
  { field: 'age', enabled: true },
  { field: 'address', enabled: true },
  { field: 'nationality', enabled: true },
];

@Controller('api/form-preferences')
@UseGuards(AuthGuard)
// @Roles('ShippingLineAdmin', 'SuperAdmin')
export class FormPreferencesController {
  constructor(
    private readonly formPreferencesService: FormPreferencesService
  ) {}

  @Get('ports')
  async getAllPorts(
    @Req() req: RequestWithUser,
    @Query('shipping_line_id') shippingLineId?: string
  ) {
    const shippingLineIdNumber = shippingLineId
      ? parseInt(shippingLineId, 10)
      : req.user.role !== 'SuperAdmin'
      ? req.user.shippingLineId
      : undefined;

    return this.formPreferencesService.getAllPorts(shippingLineIdNumber);
  }

  @Get('ports/:shippingLineId')
  async getPortsByShippingLine(
    @Param('shippingLineId') shippingLineId: string
  ) {
    return this.formPreferencesService.getPortsByShippingLine(
      Number(shippingLineId)
    );
  }

  @Get()
  // @Roles('ShippingLineAdmin', 'SuperAdmin')
  async getPreferences(
    @Req() req: RequestWithUser,
    @Query('portId') portId?: string,
    @Query('shippingLineId') shippingLineId?: string
  ) {
    const portIdNumber = portId ? parseInt(portId, 10) : null;
    const shippingLineIdNumber =
      req.user.role === 'SuperAdmin' && shippingLineId
        ? parseInt(shippingLineId, 10)
        : req.user.shippingLineId;

    if (!portIdNumber) {
      return {
        shippingLineId: shippingLineIdNumber,
        portId: null,
        data: DEFAULT_PREFERENCES,
      };
    }

    const preferences = await this.formPreferencesService.getPreferences(
      portIdNumber,
      shippingLineIdNumber
    );

    if (!preferences) {
      return {
        shippingLineId: shippingLineIdNumber,
        portId: portIdNumber,
        data: DEFAULT_PREFERENCES,
      };
    }

    return preferences;
  }

  @Post()
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async upsertPreferences(
    @Body() body: UpsertPreferenceDto,
    @Req() req: RequestWithUser
  ) {
    const shippingLineId =
      req.user.role === 'SuperAdmin'
        ? body.shippingLineId
        : req.user.shippingLineId;

    if (!shippingLineId) {
      throw new BadRequestException('Shipping line ID is required');
    }

    // Sanitize default values - convert values with only spaces to empty strings
    const sanitizedPreferences = body.preferences.map((pref) => ({
      ...pref,
      defaultValue:
        pref.defaultValue === undefined ||
        pref.defaultValue === null ||
        pref.defaultValue.trim() === ''
          ? ''
          : pref.defaultValue.trim(),
    }));

    const result = await this.formPreferencesService.upsertPreferences(
      body.portId,
      shippingLineId,
      sanitizedPreferences,
      req.user.id
    );

    return {
      shippingLineId: result.shippingLineId,
      portId: result.portId,
      data: result.data,
    };
  }
}
