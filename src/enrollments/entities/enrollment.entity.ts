import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, Column } from 'typeorm';

@Entity('enrollments')
@Unique(['studentId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  student: User;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, (course) => course.enrollments, { onDelete: 'CASCADE' })
  course: Course;

  @CreateDateColumn()
  enrolledAt: Date;
}
