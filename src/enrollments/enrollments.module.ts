import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../courses/entities/course.entity';
import { Result } from '../results/entities/result.entity';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Course, Result])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService]
})
export class EnrollmentsModule {}
