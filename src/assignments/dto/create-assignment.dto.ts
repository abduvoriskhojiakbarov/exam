import { IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}
