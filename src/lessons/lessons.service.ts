import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CourseModule } from '../modules/entities/module.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(CourseModule) private readonly modulesRepository: Repository<CourseModule>,
    @InjectRepository(Enrollment) private readonly enrollmentsRepository: Repository<Enrollment>
  ) {}

  async findByModule(moduleId: string, user: User) {
    const module = await this.findModule(moduleId);
    await this.assertCanView(module.courseId, module.course.teacherId, user);
    return this.lessonsRepository.find({ where: { moduleId }, order: { order: 'ASC' } });
  }

  async create(moduleId: string, dto: CreateLessonDto, user: User) {
    const module = await this.findModule(moduleId);
    this.assertCanManage(module.course.teacherId, user);
    return this.lessonsRepository.save(this.lessonsRepository.create({ ...dto, moduleId }));
  }

  private async findModule(moduleId: string) {
    const module = await this.modulesRepository.findOne({ where: { id: moduleId }, relations: { course: true } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  private async assertCanView(courseId: string, teacherId: string, user: User) {
    if (user.role === UserRole.ADMIN || user.id === teacherId) {
      return;
    }

    const enrolled = await this.enrollmentsRepository.findOne({ where: { courseId, studentId: user.id } });
    if (!enrolled) {
      throw new ForbiddenException('You must enroll in this course first');
    }
  }

  private assertCanManage(teacherId: string, user: User) {
    if (user.role === UserRole.ADMIN || user.id === teacherId) {
      return;
    }

    throw new ForbiddenException('Only course owner or admin can manage lessons');
  }
}
