import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, IsMobilePhone } from 'class-validator';

export class CreateRentalDto {
  @IsUUID()
  @IsNotEmpty()
  carId: string;

  @IsDateString()
  @IsNotEmpty()
  rentedFrom: string;

  @IsDateString()
  @IsNotEmpty()
  rentedTo: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsMobilePhone('uk-UA')
  @IsNotEmpty()
  tel: string;



}
