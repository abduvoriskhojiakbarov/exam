import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateModuleDto } from './dto/create-module.dto';
import { ModulesService } from './modules.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses/:courseId/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findByCourse(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.modulesService.findByCourse(courseId, user);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@Param('courseId') courseId: string, @Body() dto: CreateModuleDto, @CurrentUser() user: User) {
    return this.modulesService.create(courseId, dto, user);
  }
}
