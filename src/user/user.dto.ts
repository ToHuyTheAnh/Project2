import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  UserRole,
  UserStatus,
  UserGender,
  UserRelationship,
} from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsEnum,
  IsDateString,
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

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  hometown?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsEnum(UserRelationship)
  relationship: UserRelationship;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), [
  'password',
] as const) {}
