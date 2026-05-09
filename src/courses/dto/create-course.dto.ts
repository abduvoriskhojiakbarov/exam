import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CourseLevel } from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsString()
  category: string;

  @IsEnum(CourseLevel)
  level: CourseLevel;
}
