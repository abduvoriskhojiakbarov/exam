import { CourseModule } from '../../modules/entities/module.entity';
import { User } from '../../users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum AssignmentStatus {
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED'
}

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => User, (user) => user.assignments, { onDelete: 'CASCADE' })
  student: User;

  @Column()
  moduleId: string;

  @ManyToOne(() => CourseModule, (module) => module.assignments, { onDelete: 'CASCADE' })
  module: CourseModule;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'text', nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  score?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.SUBMITTED })
  status: AssignmentStatus;

  @CreateDateColumn()
  submittedAt: Date;
}
