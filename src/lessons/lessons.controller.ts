import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonsService } from './lessons.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modules/:moduleId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findByModule(@Param('moduleId') moduleId: string, @CurrentUser() user: User) {
    return this.lessonsService.findByModule(moduleId, user);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@Param('moduleId') moduleId: string, @Body() dto: CreateLessonDto, @CurrentUser() user: User) {
    return this.lessonsService.create(moduleId, dto, user);
  }
}
