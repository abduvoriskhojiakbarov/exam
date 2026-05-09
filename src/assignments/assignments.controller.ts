import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('modules/:moduleId/assignments')
  @Roles(UserRole.STUDENT)
  submit(@Param('moduleId') moduleId: string, @Body() dto: CreateAssignmentDto, @CurrentUser() user: User) {
    return this.assignmentsService.submit(moduleId, dto, user);
  }

  @Get('assignments/my')
  @Roles(UserRole.STUDENT)
  myAssignments(@CurrentUser() user: User) {
    return this.assignmentsService.myAssignments(user);
  }

  @Patch('assignments/:id/grade')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  grade(@Param('id') id: string, @Body() dto: GradeAssignmentDto, @CurrentUser() user: User) {
    return this.assignmentsService.grade(id, dto, user);
  }
}
