import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { ResultsService } from './results.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll() {
    return this.resultsService.findAll();
  }

  @Get('me')
  @Roles(UserRole.STUDENT)
  findMe(@CurrentUser() user: User) {
    return this.resultsService.findMe(user);
  }
}
