import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser, Roles } from '../auth/decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { ProctoringService } from './proctoring.service';
import { ProctoringOwnerGuard } from './guards';
import { SessionAccessGuard } from '../sessions/guards';

@Controller('proctoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProctoringController {
  constructor(private proctoring: ProctoringService) {}

  // GET /api/proctoring/session/:sessionId/events
  @Get('session/:sessionId/events')
  @Roles(Role.TEACHER)
  @UseGuards(ProctoringOwnerGuard)
  getSessionEvents(@Param('sessionId') sessionId: string) {
    return this.proctoring.getSessionEvents(sessionId);
  }

  // GET /api/proctoring/session/:sessionId/flags
  @Get('session/:sessionId/flags')
  @Roles(Role.TEACHER)
  @UseGuards(ProctoringOwnerGuard)
  getFlagSummary(@Param('sessionId') sessionId: string) {
    return this.proctoring.getFlagSummary(sessionId);
  }

  // GET /api/proctoring/session/:sessionId/my-events
  @Get('session/:sessionId/my-events')
  @Roles(Role.STUDENT)
  @UseGuards(SessionAccessGuard)
  getMyEvents(
    @Param('sessionId') sessionId: string,
    @GetUser('id') studentId: string,
  ) {
    return this.proctoring.getStudentEvents(sessionId, studentId);
  }
}

