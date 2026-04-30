import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser, Roles } from '../auth/decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, SubmitExamDto, SubmitAnswerDto } from './dto';
import { SessionAccessGuard, SessionOwnerGuard } from './guards';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
    constructor(private sessionsService: SessionsService) { }

    // ── Teacher routes ────────────────────────────────────────────────────

    // POST /api/sessions
    @Post()
    @Roles(Role.TEACHER)
    createSession(
        @GetUser('id') teacherId: string,
        @Body() dto: CreateSessionDto,
    ) {
        return this.sessionsService.createSession(teacherId, dto);
    }

    // PATCH /api/sessions/:sessionId/start
    @Patch(':sessionId/start')
    @Roles(Role.TEACHER)
    @UseGuards(SessionOwnerGuard)
    startSession(@Param('sessionId') sessionId: string) {
        return this.sessionsService.startSession(sessionId);
    }

    // PATCH /api/sessions/:sessionId/end
    @Patch(':sessionId/end')
    @Roles(Role.TEACHER)
    @UseGuards(SessionOwnerGuard)
    endSession(@Param('sessionId') sessionId: string) {
        return this.sessionsService.endSession(sessionId);
    }

    // GET /api/sessions/:sessionId/participants
    @Get(':sessionId/participants')
    @Roles(Role.TEACHER)
    @UseGuards(SessionOwnerGuard)
    getParticipants(@Param('sessionId') sessionId: string) {
        return this.sessionsService.getParticipants(sessionId);
    }

    // GET /api/sessions/exam/:examId
    @Get('exam/:examId')
    @Roles(Role.TEACHER)
    getSessionsByExam(
        @Param('examId') examId: string,
        @GetUser('id') teacherId: string,
    ) {
        return this.sessionsService.getSessionsByExam(examId, teacherId);
    }

    // ── Shared routes (teacher + student) ────────────────────────────────

    // GET /api/sessions/:sessionId
    @Get(':sessionId')
    @UseGuards(SessionAccessGuard)
    getSessionById(@Param('sessionId') sessionId: string) {
        return this.sessionsService.getSessionById(sessionId);
    }

    // ── Student routes ────────────────────────────────────────────────────

    // POST /api/sessions/:sessionId/join
    @Post(':sessionId/join')
    @Roles(Role.STUDENT)
    @UseGuards(SessionAccessGuard)
    joinSession(
        @Param('sessionId') sessionId: string,
        @GetUser('id') studentId: string,
    ) {
        return this.sessionsService.joinSession(sessionId, studentId);
    }

    // POST /api/sessions/:sessionId/answers
    @Post(':sessionId/answers')
    @Roles(Role.STUDENT)
    @UseGuards(SessionAccessGuard)
    saveAnswer(
        @Param('sessionId') sessionId: string,
        @GetUser('id') studentId: string,
        @Body() dto: SubmitAnswerDto,
    ) {
        return this.sessionsService.saveAnswer(
            sessionId,
            studentId,
            dto.questionId,
            dto.value,
        );
    }

    // POST /api/sessions/:sessionId/submit
    @Post(':sessionId/submit')
    @Roles(Role.STUDENT)
    @UseGuards(SessionAccessGuard)
    submitExam(
        @Param('sessionId') sessionId: string,
        @GetUser('id') studentId: string,
        @Body() dto: SubmitExamDto,
    ) {
        return this.sessionsService.submitExam(sessionId, studentId, dto);
    }

    // GET /api/sessions/:sessionId/my-answers
    @Get(':sessionId/my-answers')
    @Roles(Role.STUDENT)
    @UseGuards(SessionAccessGuard)
    getMyAnswers(
        @Param('sessionId') sessionId: string,
        @GetUser('id') studentId: string,
    ) {
        return this.sessionsService.getMyAnswers(sessionId, studentId);
    }
}
