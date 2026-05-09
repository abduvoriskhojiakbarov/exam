import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Result } from '../results/entities/result.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from './entities/enrollment.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private readonly enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Course) private readonly coursesRepository: Repository<Course>,
    @InjectRepository(Result) private readonly resultsRepository: Repository<Result>
  ) {}

  async enroll(courseId: string, student: User) {
    const course = await this.coursesRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const exists = await this.enrollmentsRepository.findOne({ where: { courseId, studentId: student.id } });
    if (exists) {
      throw new ConflictException('Student already enrolled');
    }

    const enrollment = await this.enrollmentsRepository.save(
      this.enrollmentsRepository.create({ courseId, studentId: student.id })
    );
    await this.resultsRepository.save(this.resultsRepository.create({ courseId, studentId: student.id }));
    return enrollment;
  }

  myCourses(student: User) {
    return this.enrollmentsRepository.find({
      where: { studentId: student.id },
      relations: { course: true },
      order: { enrolledAt: 'DESC' }
    });
  }

  async assertEnrolled(studentId: string, courseId: string) {
    const enrollment = await this.enrollmentsRepository.findOne({ where: { studentId, courseId } });
    if (!enrollment) {
      throw new ForbiddenException('You must enroll in this course first');
    }
  }
}
