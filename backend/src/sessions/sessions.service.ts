import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, SubmitExamDto } from './dto';
import { SessionStatus, QuestionType } from '@prisma/client';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

    // ── Helper: shuffle array with a seed ───────────────────────────────
    // Same seed always produces same order — reproducible per student
    private seededShuffle<T>(array: T[], seed: string): T[] {
        const arr = [...array];
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = (hash << 5) - hash + seed.charCodeAt(i);
            hash |= 0;
        }
        for (let i = arr.length - 1; i > 0; i--) {
            hash = (hash * 1664525 + 1013904223) & 0xffffffff;
            const j = Math.abs(hash) % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ── Helper: auto grade objective questions ───────────────────────────
    private gradeAnswers(
        questions: { id: string; type: string; answer: any }[],
        studentAnswers: { questionId: string; value: any }[],
    ): number {
        let correct = 0;

        for (const question of questions) {
            if (question.type === QuestionType.SHORT_ANSWER) continue;

            const studentAnswer = studentAnswers.find(
                (a) => a.questionId === question.id,
            );

            if (!studentAnswer) continue;

            const correctAnswer =
                typeof question.answer === 'object' && question.answer !== null
                    ? question.answer
                    : question.answer;

            if (
                JSON.stringify(studentAnswer.value) ===
                JSON.stringify(correctAnswer)
            ) {
                correct++;
            }
        }

        const gradeable = questions.filter(
            (q) => q.type !== QuestionType.SHORT_ANSWER,
        ).length;

        return gradeable === 0 ? 0 : Math.round((correct / gradeable) * 100);
    }

    // ── Create session (teacher only) ────────────────────────────────────
    async createSession(teacherId: string, dto: CreateSessionDto) {
        // verify teacher owns the exam
        const exam = await this.prisma.exam.findUnique({
            where: { id: dto.examId },
            include: {
                class: { select: { teacherId: true, name: true } },
                _count: { select: { questions: true } },
            },
        });

        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.class.teacherId !== teacherId) {
            throw new ForbiddenException('You do not own this exam');
        }

        // exam must have at least one question
        if (exam._count.questions === 0) {
            throw new BadRequestException(
                'Cannot create a session for an exam with no questions',
            );
        }

        // only one LIVE session per exam at a time
        const activeSession = await this.prisma.session.findFirst({
            where: { examId: dto.examId, status: SessionStatus.LIVE },
        });

        if (activeSession) {
            throw new ConflictException(
                'This exam already has an active session running',
            );
        }

        return this.prisma.session.create({
            data: {
                examId: dto.examId,
                status: SessionStatus.PENDING,
            },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        startAt: true,
                    },
                },
            },
        });
    }

    // ── Start session (teacher only) ─────────────────────────────────────
    async startSession(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) throw new NotFoundException('Session not found');

        if (session.status !== SessionStatus.PENDING) {
            throw new BadRequestException(
                `Session is already ${session.status.toLowerCase()}`,
            );
        }

        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: SessionStatus.LIVE,
                startedAt: new Date(),
            },
        });
    }

    // ── End session (teacher only) ───────────────────────────────────────
    async endSession(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) throw new NotFoundException('Session not found');

        if (session.status === SessionStatus.ENDED) {
            throw new BadRequestException('Session is already ended');
        }

        // auto-submit any participants who haven't submitted yet
        await this.prisma.sessionParticipant.updateMany({
            where: {
                sessionId,
                submittedAt: null,
            },
            data: {
                submittedAt: new Date(),
            },
        });

        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: SessionStatus.ENDED,
                endedAt: new Date(),
            },
        });
    }

    // ── Student joins session ─────────────────────────────────────────────
    async joinSession(sessionId: string, studentId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                exam: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });

        if (!session) throw new NotFoundException('Session not found');

        // session must be live
        if (session.status !== SessionStatus.LIVE) {
            throw new BadRequestException(
                `Cannot join a session that is ${session.status.toLowerCase()}`,
            );
        }

        // prevent duplicate joins
        const alreadyJoined = await this.prisma.sessionParticipant.findUnique({
            where: {
                sessionId_studentId: { sessionId, studentId },
            },
        });

        if (alreadyJoined) {
            // student is rejoining — return their current state
            const questions = session.exam.randomize
                ? this.seededShuffle(
                    session.exam.questions,
                    `${studentId}-${sessionId}`,
                )
                : session.exam.questions;

            return {
                participant: alreadyJoined,
                questions: questions.map(({ answer, ...q }) => q), // hide answers
                duration: session.exam.duration,
                rejoined: true,
            };
        }

        // record participant
        const participant = await this.prisma.sessionParticipant.create({
            data: { sessionId, studentId },
        });

        // shuffle questions if randomize is on
        // seed = studentId + sessionId ensures unique but reproducible order
        const questions = session.exam.randomize
            ? this.seededShuffle(
                session.exam.questions,
                `${studentId}-${sessionId}`,
            )
            : session.exam.questions;

        return {
            participant,
            questions: questions.map(({ answer, ...q }) => q), // never expose answers
            duration: session.exam.duration,
            rejoined: false,
        };
    }

    // ── Student saves a single answer ─────────────────────────────────────
    async saveAnswer(
        sessionId: string,
        studentId: string,
        questionId: string,
        value: any,
    ) {
        // verify student is a participant
        const participant = await this.prisma.sessionParticipant.findUnique({
            where: { sessionId_studentId: { sessionId, studentId } },
        });

        if (!participant) {
            throw new ForbiddenException(
                'You have not joined this session',
            );
        }

        // cannot answer after submission
        if (participant.submittedAt) {
            throw new BadRequestException(
                'You have already submitted this exam',
            );
        }

        // enforce time limit
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { exam: { select: { duration: true } } },
        });

        const elapsed =
            (Date.now() - participant.joinedAt.getTime()) / 1000 / 60;

        if (elapsed > session.exam.duration) {
            throw new BadRequestException(
                'Time is up. You can no longer save answers.',
            );
        }

        // verify question belongs to this session's exam
        const question = await this.prisma.question.findFirst({
            where: {
                id: questionId,
                exam: { sessions: { some: { id: sessionId } } },
            },
        });

        if (!question) {
            throw new NotFoundException(
                'Question does not belong to this session',
            );
        }

        // upsert — update if exists, create if not
        return this.prisma.answer.upsert({
            where: {
                sessionId_studentId_questionId: {
                    sessionId,
                    studentId,
                    questionId,
                },
            },
            update: {
                value,
                answeredAt: new Date(),
            },
            create: {
                sessionId,
                studentId,
                questionId,
                value,
            },
        });
    }

    // ── Student submits exam ──────────────────────────────────────────────
    async submitExam(
        sessionId: string,
        studentId: string,
        dto: SubmitExamDto,
    ) {
        // verify participant
        const participant = await this.prisma.sessionParticipant.findUnique({
            where: { sessionId_studentId: { sessionId, studentId } },
        });

        if (!participant) {
            throw new ForbiddenException('You have not joined this session');
        }

        if (participant.submittedAt) {
            throw new ConflictException('You have already submitted this exam');
        }

        // enforce time limit
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                exam: {
                    include: { questions: true },
                },
            },
        });

        if (session.status === SessionStatus.ENDED) {
            throw new BadRequestException('This session has already ended');
        }

        const elapsed =
            (Date.now() - participant.joinedAt.getTime()) / 1000 / 60;

        // allow a 1-minute grace period for network delays
        if (elapsed > session.exam.duration + 1) {
            throw new BadRequestException(
                'Submission rejected — time limit exceeded',
            );
        }

        // save all answers via upsert
        await Promise.all(
            dto.answers.map((answer) =>
                this.prisma.answer.upsert({
                    where: {
                        sessionId_studentId_questionId: {
                            sessionId,
                            studentId,
                            questionId: answer.questionId,
                        },
                    },
                    update: { value: answer.value, answeredAt: new Date() },
                    create: {
                        sessionId,
                        studentId,
                        questionId: answer.questionId,
                        value: answer.value,
                    },
                }),
            ),
        );

        // auto grade
        const score = this.gradeAnswers(
            session.exam.questions,
            dto.answers,
        );

        // mark as submitted with score
        const updated = await this.prisma.sessionParticipant.update({
            where: { sessionId_studentId: { sessionId, studentId } },
            data: {
                submittedAt: new Date(),
                score,
            },
        });

        return {
            message: 'Exam submitted successfully',
            score,
            submittedAt: updated.submittedAt,
        };
    }

    // ── Teacher: get all participants in a session ────────────────────────
    async getParticipants(sessionId: string) {
        return this.prisma.sessionParticipant.findMany({
            where: { sessionId },
            include: {
                student: {
                    select: { id: true, email: true },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });
    }

    // ── Teacher: get all sessions for an exam ─────────────────────────────
    async getSessionsByExam(examId: string, teacherId: string) {
        const exam = await this.prisma.exam.findFirst({
            where: {
                id: examId,
                class: { teacherId },
            },
        });

        if (!exam) throw new NotFoundException('Exam not found');

        return this.prisma.session.findMany({
            where: { examId },
            include: {
                _count: { select: { participants: true } },
            },
            orderBy: { id: 'desc' },
        });
    }

    // ── Get single session ────────────────────────────────────────────────
    async getSessionById(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        randomize: true,
                    },
                },
                _count: { select: { participants: true } },
            },
        });

        if (!session) throw new NotFoundException('Session not found');
        return session;
    }

    // ── Student: get own answers in a session ─────────────────────────────
    async getMyAnswers(sessionId: string, studentId: string) {
        const participant = await this.prisma.sessionParticipant.findUnique({
            where: { sessionId_studentId: { sessionId, studentId } },
        });

        if (!participant) {
            throw new ForbiddenException('You have not joined this session');
        }

        return this.prisma.answer.findMany({
            where: { sessionId, studentId },
            include: {
                question: {
                    select: { id: true, text: true, type: true, options: true },
                },
            },
        });
    }
}
