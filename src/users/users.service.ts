import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  avatar?: string;
  bio?: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(input: CreateUserInput): Promise<User> {
    const exists = await this.usersRepository.findOne({ where: { email: input.email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    return this.usersRepository.save(this.usersRepository.create(input));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findSafeById(id: string) {
    return this.sanitize(await this.findById(id));
  }

  async findAll() {
    const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });
    return users.map((user) => this.sanitize(user));
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    Object.assign(user, dto);
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async remove(id: string) {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  sanitize(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
