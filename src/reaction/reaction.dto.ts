import { ReactionType } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

// Enum ReactionType được import từ @prisma/client sau khi migrate schema

export class CreateReactionDto {
  @IsString()
  @IsNotEmpty()
  postId: string; // ID của bài đăng được thả cảm xúc

  @IsEnum(ReactionType)
  @IsNotEmpty()
  type: ReactionType; // Loại cảm xúc (LIKE, LOVE, ...)
}