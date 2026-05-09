import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CourseModule } from '../modules/entities/module.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, CourseModule, Enrollment])],
  controllers: [LessonsController],
  providers: [LessonsService]
})
export class LessonsModule {}
