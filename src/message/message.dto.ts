import { MessageStatus } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateMessageDto {
  // @IsString()
  // @IsNotEmpty()
  // userId: string;

  @IsString()
  @IsNotEmpty()
  chatBoxId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageStatus)
  status: MessageStatus;
}

export class UpdateMessageDto extends CreateMessageDto {}
