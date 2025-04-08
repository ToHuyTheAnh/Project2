import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserRole, UserStatus } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsOptional()
  @IsString()
  avatar: string | null;
}

export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), [
  'password',
] as const) {}
