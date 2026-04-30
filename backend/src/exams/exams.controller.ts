import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser, Roles } from '../auth/decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { ExamsService } from './exams.service';
import {
    CreateExamDto,
    UpdateExamDto,
    CreateQuestionDto,
    UpdateQuestionDto,
} from './dto';
import { ExamOwnerGuard, ExamAccessGuard } from './guards';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
    constructor(private examsService: ExamsService) { }

    // ── Teacher: Exam CRUD ───────────────────────────────────────────────

    // POST /api/exams/class/:classId
    @Post('class/:classId')
    @Roles(Role.TEACHER)
    createExam(
        @GetUser('id') teacherId: string,
        @Param('classId') classId: string,
        @Body() dto: CreateExamDto,
    ) {
        return this.examsService.createExam(teacherId, classId, dto);
    }

    // GET /api/exams/class/:classId
    @Get('class/:classId')
    @Roles(Role.TEACHER)
    getExamsByClass(
        @GetUser('id') teacherId: string,
        @Param('classId') classId: string,
    ) {
        return this.examsService.getExamsByClass(teacherId, classId);
    }

    // GET /api/exams/:examId  (teacher sees answers, student does not)
    @Get(':examId')
    @UseGuards(ExamAccessGuard)
    getExam(
        @Param('examId') examId: string,
        @GetUser('role') role: string,
    ) {
        if (role === 'TEACHER') {
            return this.examsService.getExamById(examId);
        }
        return this.examsService.getExamForStudent(examId);
    }

    // PATCH /api/exams/:examId
    @Patch(':examId')
    @Roles(Role.TEACHER)
    @UseGuards(ExamOwnerGuard)
    updateExam(
        @Param('examId') examId: string,
        @Body() dto: UpdateExamDto,
    ) {
        return this.examsService.updateExam(examId, dto);
    }

    // DELETE /api/exams/:examId
    @Delete(':examId')
    @Roles(Role.TEACHER)
    @UseGuards(ExamOwnerGuard)
    deleteExam(@Param('examId') examId: string) {
        return this.examsService.deleteExam(examId);
    }

    // ── Teacher: Question CRUD ───────────────────────────────────────────

    // POST /api/exams/:examId/questions
    @Post(':examId/questions')
    @Roles(Role.TEACHER)
    @UseGuards(ExamOwnerGuard)
    addQuestion(
        @Param('examId') examId: string,
        @Body() dto: CreateQuestionDto,
    ) {
        return this.examsService.addQuestion(examId, dto);
    }

    // GET /api/exams/:examId/questions
    @Get(':examId/questions')
    @Roles(Role.TEACHER)
    @UseGuards(ExamOwnerGuard)
    getQuestions(@Param('examId') examId: string) {
        return this.examsService.getQuestions(examId);
    }

    // PATCH /api/exams/:examId/questions/:questionId
    @Patch(':examId/questions/:questionId')
    @Roles(Role.TEACHER)
    @UseGuards(ExamOwnerGuard)
    updateQuestion(
        @Param('examId') examId: string,
        @Param('questionId') questionId: string,
        @Body() dto: UpdateQuestionDto,
    ) {
        return this.examsService.updateQuestion(examId, questionId, dto);
    }

    // DELETE /api/exams/:examId/questions/:questionId
    @Delete(':examId/questions/:questionId')
    @Roles(Role.TEACHER)
    @UseGuards(ExamOwnerGuard)
    deleteQuestion(
        @Param('examId') examId: string,
        @Param('questionId') questionId: string,
    ) {
        return this.examsService.deleteQuestion(examId, questionId);
    }
}
