import { CourseModule } from '../../modules/entities/module.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  videoUrl: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  moduleId: string;

  @ManyToOne(() => CourseModule, (module) => module.lessons, { onDelete: 'CASCADE' })
  module: CourseModule;

  @Column({ default: 1 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}
