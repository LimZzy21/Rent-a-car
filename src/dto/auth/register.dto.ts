import { Prisma } from '@prisma/client';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { IsEmail } from 'class-validator';

export class RegisterDto implements Prisma.UserCreateInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}
