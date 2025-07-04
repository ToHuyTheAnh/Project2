import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTrendTopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateTrendTopicDto extends CreateTrendTopicDto {}
