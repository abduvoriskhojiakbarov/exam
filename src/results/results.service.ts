import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Result } from './entities/result.entity';

@Injectable()
export class ResultsService {
  constructor(@InjectRepository(Result) private readonly resultsRepository: Repository<Result>) {}

  findAll() {
    return this.resultsRepository.find({ relations: { student: true, course: true } });
  }

  findMe(student: User) {
    return this.resultsRepository.find({
      where: { studentId: student.id },
      relations: { course: true }
    });
  }
}
