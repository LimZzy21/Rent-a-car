import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

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
} 