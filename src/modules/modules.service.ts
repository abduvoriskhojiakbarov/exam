import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateModuleDto } from './dto/create-module.dto';
import { CourseModule } from './entities/module.entity';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(CourseModule) private readonly modulesRepository: Repository<CourseModule>,
    @InjectRepository(Course) private readonly coursesRepository: Repository<Course>,
    @InjectRepository(Enrollment) private readonly enrollmentsRepository: Repository<Enrollment>
  ) {}

  async findByCourse(courseId: string, user: User) {
    await this.assertCanViewCourse(courseId, user);
    return this.modulesRepository.find({ where: { courseId }, order: { order: 'ASC' } });
  }

  async create(courseId: string, dto: CreateModuleDto, user: User) {
    const course = await this.findCourse(courseId);
    this.assertCanManage(course, user);
    return this.modulesRepository.save(this.modulesRepository.create({ ...dto, courseId }));
  }

  async findOne(id: string): Promise<CourseModule> {
    const module = await this.modulesRepository.findOne({ where: { id }, relations: { course: true } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  private async assertCanViewCourse(courseId: string, user: User) {
    const course = await this.findCourse(courseId);
    if (user.role === UserRole.ADMIN || course.teacherId === user.id) {
      return;
    }

    const enrolled = await this.enrollmentsRepository.findOne({ where: { courseId, studentId: user.id } });
    if (!enrolled) {
      throw new ForbiddenException('You must enroll in this course first');
    }
  }

  private async findCourse(courseId: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  private assertCanManage(course: Course, user: User) {
    if (user.role === UserRole.ADMIN || course.teacherId === user.id) {
      return;
    }

    throw new ForbiddenException('Only course owner or admin can manage modules');
  }
}
