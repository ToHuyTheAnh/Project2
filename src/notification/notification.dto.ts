import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  actor: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateNotificationDto extends CreateNotificationDto {}
