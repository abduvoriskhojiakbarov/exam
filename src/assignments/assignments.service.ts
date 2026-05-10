import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CourseModule } from '../modules/entities/module.entity';
import { Result } from '../results/entities/result.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { Assignment, AssignmentStatus } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment) private readonly assignmentsRepository: Repository<Assignment>,
    @InjectRepository(CourseModule) private readonly modulesRepository: Repository<CourseModule>,
    @InjectRepository(Enrollment) private readonly enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Result) private readonly resultsRepository: Repository<Result>
  ) {}

  async submit(moduleId: string, dto: CreateAssignmentDto & { videoUrl?: string }, student: User) {
    const module = await this.findModule(moduleId);
    await this.assertEnrolled(student.id, module.courseId);
    return this.assignmentsRepository.save(
      this.assignmentsRepository.create({ moduleId, studentId: student.id, answer: dto.answer, videoUrl: dto.videoUrl })
    );
  }

  myAssignments(student: User) {
    return this.assignmentsRepository.find({
      where: { studentId: student.id },
      relations: { module: true },
      order: { submittedAt: 'DESC' }
    });
  }

  async grade(id: string, dto: GradeAssignmentDto, user: User) {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: { module: { course: true } }
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    if (user.role !== UserRole.ADMIN && assignment.module.course.teacherId !== user.id) {
      throw new ForbiddenException('Only course teacher or admin can grade this assignment');
    }

    assignment.score = dto.score;
    assignment.feedback = dto.feedback;
    assignment.status = AssignmentStatus.GRADED;
    const saved = await this.assignmentsRepository.save(assignment);

    await this.resultsRepository.upsert(
      {
        studentId: assignment.studentId,
        courseId: assignment.module.courseId,
        totalScore: dto.score,
        completedLessons: 0,
        completionPercent: 0
      },
      ['studentId', 'courseId']
    );

    return saved;
  }

  private async findModule(moduleId: string) {
    const module = await this.modulesRepository.findOne({ where: { id: moduleId }, relations: { course: true } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  private async assertEnrolled(studentId: string, courseId: string) {
    const enrolled = await this.enrollmentsRepository.findOne({ where: { studentId, courseId } });
    if (!enrolled) {
      throw new ForbiddenException('You must enroll in this course first');
    }
  }
}
