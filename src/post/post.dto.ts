import { PostStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  trendTopicId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostStatus)
  status: PostStatus;

  @IsNumber()
  @IsOptional()
  like?: number = 0;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
