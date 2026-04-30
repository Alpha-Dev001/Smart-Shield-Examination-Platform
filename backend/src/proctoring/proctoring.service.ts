import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProctoringEventType } from '@prisma/client';

@Injectable()
export class ProctoringService {
  private readonly logger = new Logger(ProctoringService.name);

  // in-memory heartbeat tracker
  // key: `${sessionId}:${studentId}` → last heartbeat timestamp
  private heartbeats = new Map<string, number>();

  // in-memory missed heartbeat counter
  // key: `${sessionId}:${studentId}` → consecutive missed count
  private missedHeartbeats = new Map<string, number>();

  constructor(private prisma: PrismaService) {}

  // ── Save a proctoring event ──────────────────────────────────────────
  async saveEvent(
    sessionId: string,
    studentId: string,
    type: ProctoringEventType,
  ) {
    // save event to database
    const event = await this.prisma.proctoringEvent.create({
      data: { sessionId, studentId, type },
      include: {
        student: { select: { id: true, email: true } },
      },
    });

    // increment flag count on participant record
    await this.prisma.sessionParticipant.update({
      where: {
        sessionId_studentId: { sessionId, studentId },
      },
      data: {
        flagCount: { increment: 1 },
      },
    });

    this.logger.warn(
      `Flag: ${type} | student: ${studentId} | session: ${sessionId}`,
    );

    return event;
  }

  // ── Record heartbeat ─────────────────────────────────────────────────
  recordHeartbeat(sessionId: string, studentId: string) {
    const key = `${sessionId}:${studentId}`;
    this.heartbeats.set(key, Date.now());
    this.missedHeartbeats.set(key, 0); // reset missed count on heartbeat
  }

  // ── Get last heartbeat time ──────────────────────────────────────────
  getLastHeartbeat(sessionId: string, studentId: string): number | null {
    return this.heartbeats.get(`${sessionId}:${studentId}`) ?? null;
  }

  // ── Check if student is still active ────────────────────────────────
  isStudentActive(sessionId: string, studentId: string): boolean {
    const last = this.getLastHeartbeat(sessionId, studentId);
    if (!last) return false;
    // inactive if no heartbeat in last 30 seconds
    return Date.now() - last < 30_000;
  }

  // ── Increment missed heartbeat count ────────────────────────────────
  incrementMissed(sessionId: string, studentId: string): number {
    const key = `${sessionId}:${studentId}`;
    const current = this.missedHeartbeats.get(key) ?? 0;
    const updated = current + 1;
    this.missedHeartbeats.set(key, updated);
    return updated;
  }

  // ── Clean up when student disconnects ───────────────────────────────
  cleanupStudent(sessionId: string, studentId: string) {
    const key = `${sessionId}:${studentId}`;
    this.heartbeats.delete(key);
    this.missedHeartbeats.delete(key);
  }

  // ── Get all proctoring events for a session ──────────────────────────
  async getSessionEvents(sessionId: string) {
    return this.prisma.proctoringEvent.findMany({
      where: { sessionId },
      include: {
        student: { select: { id: true, email: true } },
      },
      orderBy: { occurredAt: 'desc' },
    });
  }

  // ── Get proctoring events for a specific student in a session ────────
  async getStudentEvents(sessionId: string, studentId: string) {
    return this.prisma.proctoringEvent.findMany({
      where: { sessionId, studentId },
      orderBy: { occurredAt: 'asc' },
    });
  }

  // ── Get flag summary for all students in a session ───────────────────
  async getFlagSummary(sessionId: string) {
    return this.prisma.sessionParticipant.findMany({
      where: { sessionId },
      select: {
        flagCount: true,
        student: { select: { id: true, email: true } },
      },
      orderBy: { flagCount: 'desc' },
    });
  }
}
