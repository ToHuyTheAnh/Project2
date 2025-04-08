import { CommentStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(CommentStatus)
  status: CommentStatus;

  @IsNumber()
  likes: number;

  @IsOptional()
  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}

export class UpdateCommentDto extends CreateCommentDto {}
