import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { EnrollmentsService } from './enrollments.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('courses/:id/enroll')
  @Roles(UserRole.STUDENT)
  enroll(@Param('id') courseId: string, @CurrentUser() user: User) {
    return this.enrollmentsService.enroll(courseId, user);
  }

  @Get('my-courses')
  @Roles(UserRole.STUDENT)
  myCourses(@CurrentUser() user: User) {
    return this.enrollmentsService.myCourses(user);
  }
}
