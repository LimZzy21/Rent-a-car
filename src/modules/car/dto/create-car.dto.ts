import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDetailsDto {
  @IsString()
  @IsNotEmpty()
  fuelType: string;

  @IsInt()
  @IsNotEmpty()
  topSpeed: number;

  @IsNumber()
  @IsNotEmpty()
  acceleration: number; 

  @IsString()
  @IsNotEmpty()
  transmission: string;

  @IsInt()
  @IsNotEmpty()
  mileage: number;

  @IsNumber()
  @IsNotEmpty()
  engineSize: number;

  @IsNumber()
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

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsBoolean()
  @IsOptional()
  isCurrentlyRented?: boolean;

  @ValidateNested()
  @Type(() => CreateCarDetailsDto)
  carDetails: CreateCarDetailsDto;

  @IsArray()
  @IsOptional()
  images: Express.Multer.File[];

  @IsArray()
  features: string[];
}
