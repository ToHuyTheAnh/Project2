import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateChatBoxDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds: string[];
}
