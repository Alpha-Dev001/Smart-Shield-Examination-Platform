import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser, Roles } from '../auth/decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { ClassesService } from './classes.service';
import { CreateClassDto, JoinClassDto } from './dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard) // all routes require authentication
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  // ── Teacher routes ───────────────────────────────────────────────────

  // POST /api/classes
  @Post()
  @Roles(Role.TEACHER)
  createClass(
    @GetUser('id') teacherId: string,
    @Body() dto: CreateClassDto,
  ) {
    return this.classesService.createClass(teacherId, dto);
  }

  // GET /api/classes
  @Get()
  @Roles(Role.TEACHER)
  getMyClasses(@GetUser('id') teacherId: string) {
    return this.classesService.getMyClasses(teacherId);
  }

  // GET /api/classes/:classId
  @Get(':classId')
  @Roles(Role.TEACHER)
  getClassById(
    @Param('classId') classId: string,
    @GetUser('id') teacherId: string,
  ) {
    return this.classesService.getClassById(classId, teacherId);
  }

  // DELETE /api/classes/:classId
  @Delete(':classId')
  @Roles(Role.TEACHER)
  deleteClass(
    @Param('classId') classId: string,
    @GetUser('id') teacherId: string,
  ) {
    return this.classesService.deleteClass(teacherId, classId);
  }

  // DELETE /api/classes/:classId/students/:studentId
  @Delete(':classId/students/:studentId')
  @Roles(Role.TEACHER)
  removeStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @GetUser('id') teacherId: string,
  ) {
    return this.classesService.removeStudent(teacherId, classId, studentId);
  }

  // ── Student routes ───────────────────────────────────────────────────

  // POST /api/classes/join
  @Post('join')
  @Roles(Role.STUDENT)
  joinClass(
    @GetUser('id') studentId: string,
    @Body() dto: JoinClassDto,
  ) {
    return this.classesService.joinClass(studentId, dto);
  }

  // POST /api/classes/leave
  @Post('leave')
  @Roles(Role.STUDENT)
  leaveClass(@GetUser('id') studentId: string) {
    return this.classesService.leaveClass(studentId);
  }

  // GET /api/classes/my-class
  @Get('my-class')
  @Roles(Role.STUDENT)
  getMyClass(@GetUser('id') studentId: string) {
    return this.classesService.getMyClass(studentId);
  }
}