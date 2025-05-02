import { CommentStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
