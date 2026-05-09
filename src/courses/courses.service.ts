import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(@InjectRepository(Course) private readonly coursesRepository: Repository<Course>) {}

  async findAll(search?: string, page = 1, limit = 10) {
    const take = Math.min(limit, 50);
    const [items, total] = await this.coursesRepository.findAndCount({
      where: search ? [{ title: ILike(`%${search}%`) }, { category: ILike(`%${search}%`) }] : {},
      relations: { teacher: true },
      skip: (page - 1) * take,
      take,
      order: { createdAt: 'DESC' }
    });

    return { items, total, page, limit: take };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: { teacher: true, modules: true }
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  create(dto: CreateCourseDto, teacher: User) {
    return this.coursesRepository.save(this.coursesRepository.create({ ...dto, teacherId: teacher.id }));
  }

  async update(id: string, dto: UpdateCourseDto, user: User) {
    const course = await this.findOne(id);
    this.assertCanManage(course, user);
    Object.assign(course, dto);
    return this.coursesRepository.save(course);
  }

  async remove(id: string, user: User) {
    const course = await this.findOne(id);
    this.assertCanManage(course, user);
    await this.coursesRepository.remove(course);
    return { message: 'Course deleted successfully' };
  }

  assertCanManage(course: Course, user: User) {
    if (user.role === UserRole.ADMIN || course.teacherId === user.id) {
      return;
    }

    throw new ForbiddenException('Only course owner or admin can manage this course');
  }
}
