import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
const { diskStorage } = require('multer');
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
  @UseInterceptors(FileInterceptor('video', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: any, file: any, callback: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  submit(
    @Param('moduleId') moduleId: string,
    @Body() body: any,
    @UploadedFile() video: any,
    @CurrentUser() user: User
  ) {
    const dto = { answer: body.answer, videoUrl: video ? `/uploads/${video.filename}` : undefined };
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
