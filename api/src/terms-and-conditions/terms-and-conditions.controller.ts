import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TermsAndConditionsService } from './terms-and-conditions.service';
import { CreateTermsAndConditionsDto, UpdateTermsAndConditionsDto } from './terms-and-conditions.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('terms-and-conditions')
@UseGuards(AuthGuard)
export class TermsAndConditionsController {
  constructor(private readonly termsAndConditionsService: TermsAndConditionsService) {}

  @Post()
  async createTermsAndConditions(@Body() createDto: CreateTermsAndConditionsDto) {
    return this.termsAndConditionsService.createTermsAndConditions(createDto);
  }

  @Get()
  async getAllTermsAndConditions() {
    return this.termsAndConditionsService.getAllTermsAndConditions();
  }

  @Get('shipping-line/:shippingLineId')
  async getTermsAndConditionsForShippingLine(
    @Param('shippingLineId') shippingLineId: string,
  ) {
    return this.termsAndConditionsService.getTermsAndConditionsForShippingLine(Number(shippingLineId));
  }

  // Admin view: Retrieve Terms and Conditions for a shipping line (both active and inactive)
  @Get('admin/shipping-line/:shippingLineId')
  async getTermsAndConditionsForShippingLineAdmin(
    @Param('shippingLineId') shippingLineId: string,
  ) {
    return this.termsAndConditionsService.getAdminShippingLineTermsAndConditions(Number(shippingLineId));
  }

  // Update a Terms and Conditions record by ID
  @Put(':id')
  async updateTermsAndConditions(
    @Param('id') id: string,
    @Body() updateDto: UpdateTermsAndConditionsDto,
  ) {
    return this.termsAndConditionsService.updateTermsAndConditions(Number(id), updateDto);
  }

  // Delete a Terms and Conditions record by ID
  @Delete(':id')
  async deleteTermsAndConditions(@Param('id') id: string) {
    return this.termsAndConditionsService.deleteTermsAndConditions(Number(id));
  }
}
