import { IsString, IsNotEmpty } from 'class-validator';

export class CreateChatBoxDto {
  @IsString()
  @IsNotEmpty()
  userIds: string[];
}
