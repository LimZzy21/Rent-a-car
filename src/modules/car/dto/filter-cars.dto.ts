import { IsOptional, IsString, IsNumber, IsBoolean, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterCarsDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    if (value === '1') return true;
    if (value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  isCurrentlyRented?: boolean;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 6;

  @IsOptional()
  @IsString()
  @IsIn(['price', 'name', 'rating', 'createdAt'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
} 