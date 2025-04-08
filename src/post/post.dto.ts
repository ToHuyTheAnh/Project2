import { PostStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostStatus)
  status: PostStatus;

  @IsNumber()
  likes: number;

  @IsOptional()
  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}

export class UpdatePostDto extends CreatePostDto {}
