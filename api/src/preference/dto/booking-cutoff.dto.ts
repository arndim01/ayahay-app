import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateBookingCutoffDto {
  @IsNumber()
  @IsNotEmpty()
  shipping_line_id: number;

  @IsNumber()
  @IsNotEmpty()
  origin: number;

  @IsNumber()
  @IsNotEmpty()
  destination: number;

  @IsString()
  @IsNotEmpty()
  cut_off_condition_type: string;

  @IsNumber()
  @IsNotEmpty()
  cut_off_value: number;

  @IsOptional()
  @IsString()
  created_by?: string;
}

export class UpdateBookingCutoffDto extends CreateBookingCutoffDto {
  @IsOptional()
  @IsString()
  updated_by?: string;
}
