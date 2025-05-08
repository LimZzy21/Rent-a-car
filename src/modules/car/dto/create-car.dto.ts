import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDetailsDto {
  @IsString()
  @IsNotEmpty()
  fuelType: string;

  @IsString()
  @IsNotEmpty()
  transmission: string;

  @IsInt()
  @IsNotEmpty()
  mileage: number;

  @IsInt()
  @IsNotEmpty()
  engineSize: number;

  @IsInt()
  @IsNotEmpty()
  enginePower: number;
}

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  rating: number;

  @IsBoolean()
  @IsOptional()
  isCurrentlyRented?: boolean;

  @ValidateNested()
  @Type(() => CreateCarDetailsDto)
  @IsOptional()
  carDetails?: CreateCarDetailsDto;
}
