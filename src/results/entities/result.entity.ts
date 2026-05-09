import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('results')
@Unique(['studentId', 'courseId'])
export class Result {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => User, (user) => user.results, { onDelete: 'CASCADE' })
  student: User;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, (course) => course.results, { onDelete: 'CASCADE' })
  course: Course;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  totalScore: number;

  @Column({ default: 0 })
  completedLessons: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercent: number;
}
