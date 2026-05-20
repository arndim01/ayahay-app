import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateTermsAndConditionsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  shippingLineId: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateTermsAndConditionsDto extends PartialType(CreateTermsAndConditionsDto) {}
