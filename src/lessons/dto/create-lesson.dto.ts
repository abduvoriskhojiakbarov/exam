import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  videoUrl: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}
