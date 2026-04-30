import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetResultsDto, ResultAnalyticsDto, ResultSortBy } from './dto';
import { QuestionType } from '@prisma/client';

@Injectable()
export class ResultsService {
    constructor(private prisma: PrismaService) { }

    // ── Teacher: Get all results for a session with detailed analytics ──────────
    async getSessionResults(sessionId: string, teacherId: string, dto: GetResultsDto) {
        // Verify teacher owns this session
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                exam: {
                    include: {
                        class: { select: { teacherId: true } },
                        questions: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });

        if (!session) throw new NotFoundException('Session not found');
        if (session.exam.class.teacherId !== teacherId) {
            throw new ForbiddenException('You do not own this session');
        }

        // Build base query
        const whereClause: any = { sessionId };

        // Add search filter if provided
        if (dto.search) {
            whereClause.student = {
                email: {
                    contains: dto.search,
                    mode: 'insensitive',
                },
            };
        }

        // Get participants with their answers
        const participants = await this.prisma.sessionParticipant.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });

        // Get all answers for this session
        const allAnswers = await this.prisma.answer.findMany({
            where: { sessionId },
            include: {
                question: {
                    select: {
                        id: true,
                        text: true,
                        type: true,
                        options: true,
                        answer: true,
                        points: true,
                    },
                },
            },
        });

        // Process results with detailed scoring
        const results = participants.map(participant => {
            const participantAnswers = allAnswers.filter(a => a.studentId === participant.studentId);
            const totalPoints = session.exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
            const earnedPoints = this.calculateEarnedPoints(participantAnswers, session.exam.questions);
            const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
            const timeTaken = this.calculateTimeTaken(participant.joinedAt, participant.submittedAt);

            return {
                participant: {
                    id: participant.id,
                    studentId: participant.studentId,
                    student: participant.student,
                    joinedAt: participant.joinedAt,
                    submittedAt: participant.submittedAt,
                    score: participant.score,
                    timeTaken,
                    status: this.getParticipantStatus(participant),
                },
                scoring: {
                    totalQuestions: session.exam.questions.length,
                    attemptedQuestions: participantAnswers.length,
                    correctAnswers: this.countCorrectAnswers(participantAnswers, session.exam.questions),
                    totalPoints,
                    earnedPoints,
                    percentage,
                },
                answers: participantAnswers.map(answer => ({
                    questionId: answer.questionId,
                    question: answer.question.text,
                    type: answer.question.type,
                    studentAnswer: answer.value,
                    correctAnswer: answer.question.answer,
                    points: answer.question.points || 1,
                    awardedPoints: answer.awardedPoints ?? null,
                    earnedPoints: answer.question.type === QuestionType.SHORT_ANSWER
                        ? Math.max(
                            0,
                            Math.min(
                                answer.awardedPoints ?? 0,
                                answer.question.points || 1,
                            ),
                        )
                        : (this.isAnswerCorrect(
                            answer.value,
                            answer.question.answer,
                            answer.question.type,
                        )
                            ? (answer.question.points || 1)
                            : 0),
                    isCorrect: answer.question.type === QuestionType.SHORT_ANSWER
                        ? (answer.awardedPoints ?? 0) >= (answer.question.points || 1)
                        : this.isAnswerCorrect(
                            answer.value,
                            answer.question.answer,
                            answer.question.type,
                        ),
                })),
            };
        });

        // Sort results
        const sortedResults = this.sortResults(results, dto.sortBy ?? ResultSortBy.SCORE_DESC);

        // Calculate session analytics
        const analytics = this.calculateSessionAnalytics(sortedResults, session.exam);

        return {
            session: {
                id: session.id,
                examId: session.examId,
                examTitle: session.exam.title,
                status: session.status,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                totalParticipants: participants.length,
            },
            analytics,
            results: sortedResults,
        };
    }

    // ── Student: Get own results for a session ───────────────────────────────
    async getMyResults(sessionId: string, studentId: string) {
        const participant = await this.prisma.sessionParticipant.findUnique({
            where: { sessionId_studentId: { sessionId, studentId } },
            include: {
                session: {
                    include: {
                        exam: {
                            include: {
                                questions: {
                                    orderBy: { order: 'asc' },
                                },
                            },
                        },
                    },
                },
                answers: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                text: true,
                                type: true,
                                options: true,
                                answer: true,
                                points: true,
                                explanation: true,
                            },
                        },
                    },
                },
            },
        });

        if (!participant) {
            throw new ForbiddenException('You did not participate in this session');
        }

        const totalPoints = participant.session.exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        const earnedPoints = this.calculateEarnedPoints(participant.answers, participant.session.exam.questions);
        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const timeTaken = this.calculateTimeTaken(participant.joinedAt, participant.submittedAt);

        return {
            session: {
                id: participant.session.id,
                examId: participant.session.examId,
                examTitle: participant.session.exam.title,
                duration: participant.session.exam.duration,
                startedAt: participant.session.startedAt,
            },
            result: {
                score: participant.score,
                totalQuestions: participant.session.exam.questions.length,
                attemptedQuestions: participant.answers.length,
                correctAnswers: this.countCorrectAnswers(participant.answers, participant.session.exam.questions),
                totalPoints,
                earnedPoints,
                percentage,
                timeTaken,
                joinedAt: participant.joinedAt,
                submittedAt: participant.submittedAt,
                status: this.getParticipantStatus(participant),
            },
            answers: participant.answers.map(answer => ({
                questionId: answer.questionId,
                question: answer.question.text,
                type: answer.question.type,
                options: answer.question.options,
                studentAnswer: answer.value,
                correctAnswer: answer.question.answer,
                explanation: answer.question.explanation,
                points: answer.question.points || 1,
                awardedPoints: answer.awardedPoints ?? null,
                earnedPoints: answer.question.type === QuestionType.SHORT_ANSWER
                    ? Math.max(0, Math.min(answer.awardedPoints ?? 0, answer.question.points || 1))
                    : (this.isAnswerCorrect(answer.value, answer.question.answer, answer.question.type)
                        ? (answer.question.points || 1)
                        : 0),
                isCorrect: answer.question.type === QuestionType.SHORT_ANSWER
                    ? (answer.awardedPoints ?? 0) >= (answer.question.points || 1)
                    : this.isAnswerCorrect(answer.value, answer.question.answer, answer.question.type),
            })),
        };
    }

    // ── Teacher: Get comprehensive analytics for an exam ─────────────────────
    async getExamAnalytics(examId: string, teacherId: string, dto: ResultAnalyticsDto) {
        // Verify teacher owns the exam
        const exam = await this.prisma.exam.findFirst({
            where: {
                id: examId,
                class: { teacherId },
            },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
                sessions: {
                    include: {
                        participants: {
                            include: {
                                student: {
                                    select: { id: true, email: true, firstName: true, lastName: true },
                                },
                                answers: true,
                            },
                        },
                    },
                },
                class: {
                    select: {
                        id: true,
                        name: true,
                        students: {
                            select: { id: true, email: true, firstName: true, lastName: true },
                        },
                    },
                },
            },
        });

        if (!exam) throw new NotFoundException('Exam not found');

        // Aggregate all sessions data
        const allParticipants = exam.sessions.flatMap(session =>
            session.participants.map(p => ({ ...p, sessionId: session.id, session }))
        );

        // Calculate overall statistics
        const totalStudents = exam.class.students.length;
        const participatedStudents = new Set(allParticipants.map(p => p.studentId)).size;
        const submittedStudents = allParticipants.filter(p => p.submittedAt).length;
        const averageScore = submittedStudents > 0
            ? allParticipants.filter(p => p.submittedAt).reduce((sum, p) => sum + (p.score || 0), 0) / submittedStudents
            : 0;

        // Question-wise analytics
        const questionAnalytics = exam.questions.map(question => {
            const questionAnswers = allParticipants.flatMap(p =>
                p.answers.filter(a => a.questionId === question.id)
            );

            const correctCount = questionAnswers.filter(a =>
                this.isAnswerCorrect(a.value, question.answer, question.type)
            ).length;

            const attemptedCount = questionAnswers.length;

            return {
                questionId: question.id,
                questionText: question.text,
                type: question.type,
                points: question.points || 1,
                totalAttempts: attemptedCount,
                correctAnswers: correctCount,
                incorrectAnswers: attemptedCount - correctCount,
                accuracy: attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0,
                difficulty: this.calculateDifficulty(correctCount, attemptedCount, participatedStudents),
            };
        });

        // Performance distribution
        const performanceDistribution = this.calculatePerformanceDistribution(
            allParticipants.filter(p => p.submittedAt)
        );

        // Time analysis
        const timeAnalysis = this.calculateTimeAnalysis(allParticipants.filter(p => p.submittedAt), exam.duration);

        return {
            exam: {
                id: exam.id,
                title: exam.title,
                duration: exam.duration,
                totalQuestions: exam.questions.length,
                totalPoints: exam.questions.reduce((sum, q) => sum + (q.points || 1), 0),
                sessionsCount: exam.sessions.length,
            },
            participation: {
                totalStudents,
                participatedStudents,
                submittedStudents,
                participationRate: Math.round((participatedStudents / totalStudents) * 100),
                completionRate: participatedStudents > 0 ? Math.round((submittedStudents / participatedStudents) * 100) : 0,
            },
            performance: {
                averageScore: Math.round(averageScore * 100) / 100,
                highestScore: Math.max(...allParticipants.filter(p => p.submittedAt).map(p => p.score || 0)),
                lowestScore: Math.min(...allParticipants.filter(p => p.submittedAt).map(p => p.score || 0)),
                distribution: performanceDistribution,
            },
            questionAnalytics,
            timeAnalysis,
        };
    }

    // ── Helper methods ───────────────────────────────────────────────────────

    private calculateEarnedPoints(answers: any[], questions: any[]): number {
        return answers.reduce((total, answer) => {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question) return total;

            if (question.type === QuestionType.SHORT_ANSWER) {
                const awarded = typeof answer.awardedPoints === 'number' ? answer.awardedPoints : 0;
                const maxPoints = question.points || 1;
                return total + Math.max(0, Math.min(awarded, maxPoints));
            }

            const isCorrect = this.isAnswerCorrect(answer.value, question.answer, question.type);
            return total + (isCorrect ? (question.points || 1) : 0);
        }, 0);
    }

    private countCorrectAnswers(answers: any[], questions: any[]): number {
        return answers.filter(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question) return false;
            if (question.type === QuestionType.SHORT_ANSWER) {
                const maxPoints = question.points || 1;
                return (answer.awardedPoints ?? 0) >= maxPoints;
            }
            return this.isAnswerCorrect(answer.value, question.answer, question.type);
        }).length;
    }

    private isAnswerCorrect(studentAnswer: any, correctAnswer: any, questionType: string): boolean {
        if (questionType === QuestionType.SHORT_ANSWER) return false;

        if (questionType === QuestionType.TRUE_FALSE) {
            return studentAnswer === correctAnswer;
        }

        if (questionType === QuestionType.MCQ) {
            return JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer);
        }

        return false;
    }

    private calculateTimeTaken(joinedAt: Date, submittedAt: Date | null): number | null {
        if (!submittedAt) return null;
        return Math.round((submittedAt.getTime() - joinedAt.getTime()) / 1000 / 60); // minutes
    }

    private getParticipantStatus(participant: any): string {
        if (!participant.submittedAt) {
            return 'IN_PROGRESS';
        }
        return 'SUBMITTED';
    }

    private sortResults(results: any[], sortBy: ResultSortBy): any[] {
        return results.sort((a, b) => {
            switch (sortBy) {
                case ResultSortBy.SCORE_ASC:
                    return a.scoring.percentage - b.scoring.percentage;
                case ResultSortBy.SCORE_DESC:
                    return b.scoring.percentage - a.scoring.percentage;
                case ResultSortBy.TIME_ASC:
                    return (a.participant.timeTaken || Infinity) - (b.participant.timeTaken || Infinity);
                case ResultSortBy.TIME_DESC:
                    return (b.participant.timeTaken || 0) - (a.participant.timeTaken || 0);
                case ResultSortBy.NAME_ASC:
                    return a.participant.student.email.localeCompare(b.participant.student.email);
                case ResultSortBy.NAME_DESC:
                    return b.participant.student.email.localeCompare(a.participant.student.email);
                default:
                    return b.scoring.percentage - a.scoring.percentage;
            }
        });
    }

    private calculateSessionAnalytics(results: any[], exam: any): any {
        const submittedResults = results.filter(r => r.participant.status === 'SUBMITTED');

        if (submittedResults.length === 0) {
            return {
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                passRate: 0,
                averageTime: 0,
            };
        }

        const scores = submittedResults.map(r => r.scoring.percentage);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const passRate = (scores.filter(score => score >= 50).length / scores.length) * 100;

        const times = submittedResults
            .map(r => r.participant.timeTaken)
            .filter(time => time !== null) as number[];
        const averageTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;

        return {
            averageScore: Math.round(averageScore * 100) / 100,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            passRate: Math.round(passRate),
            averageTime: Math.round(averageTime),
        };
    }

    private calculatePerformanceDistribution(submittedParticipants: any[]): any[] {
        const ranges = [
            { label: '0-20', min: 0, max: 20, count: 0 },
            { label: '21-40', min: 21, max: 40, count: 0 },
            { label: '41-60', min: 41, max: 60, count: 0 },
            { label: '61-80', min: 61, max: 80, count: 0 },
            { label: '81-100', min: 81, max: 100, count: 0 },
        ];

        submittedParticipants.forEach(p => {
            const score = p.score || 0;
            const range = ranges.find(r => score >= r.min && score <= r.max);
            if (range) range.count++;
        });

        return ranges.map(range => ({
            ...range,
            percentage: submittedParticipants.length > 0
                ? Math.round((range.count / submittedParticipants.length) * 100)
                : 0,
        }));
    }

    private calculateTimeAnalysis(submittedParticipants: any[], examDuration: number): any {
        const times = submittedParticipants
            .map(p => this.calculateTimeTaken(p.joinedAt, p.submittedAt))
            .filter(time => time !== null) as number[];

        if (times.length === 0) {
            return {
                averageTime: 0,
                fastestTime: 0,
                slowestTime: 0,
                earlySubmissions: 0,
                onTimeSubmissions: 0,
                lateSubmissions: 0,
            };
        }

        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const fastestTime = Math.min(...times);
        const slowestTime = Math.max(...times);

        const earlySubmissions = times.filter(time => time < examDuration * 0.8).length;
        const onTimeSubmissions = times.filter(time => time >= examDuration * 0.8 && time <= examDuration).length;
        const lateSubmissions = times.filter(time => time > examDuration).length;

        return {
            averageTime: Math.round(averageTime),
            fastestTime,
            slowestTime,
            earlySubmissions,
            onTimeSubmissions,
            lateSubmissions,
        };
    }

    private calculateDifficulty(correctCount: number, attemptedCount: number, totalStudents: number): string {
        if (attemptedCount === 0) return 'N/A';

        const accuracy = correctCount / attemptedCount;
        const participationRate = attemptedCount / totalStudents;

        if (accuracy >= 0.8 && participationRate >= 0.8) return 'Easy';
        if (accuracy >= 0.6 && participationRate >= 0.6) return 'Medium';
        if (accuracy >= 0.4 && participationRate >= 0.4) return 'Hard';
        return 'Very Hard';
    }

    // ── Teacher: list short-answer responses for a session ──────────────────
    async getSessionShortAnswers(sessionId: string, teacherId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                exam: {
                    include: {
                        class: { select: { teacherId: true } },
                        questions: {
                            where: { type: QuestionType.SHORT_ANSWER },
                            orderBy: { order: 'asc' },
                            select: { id: true, text: true, points: true, explanation: true },
                        },
                    },
                },
            },
        });

        if (!session) throw new NotFoundException('Session not found');
        if (session.exam.class.teacherId !== teacherId) {
            throw new ForbiddenException('You do not own this session');
        }

        const participants = await this.prisma.sessionParticipant.findMany({
            where: { sessionId },
            include: {
                student: {
                    select: { id: true, email: true, firstName: true, lastName: true },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });

        const answers = await this.prisma.answer.findMany({
            where: {
                sessionId,
                question: { type: QuestionType.SHORT_ANSWER },
            },
            include: {
                question: { select: { id: true, text: true, points: true } },
                gradedBy: { select: { id: true, email: true } },
            },
        });

        return {
            sessionId,
            examId: session.examId,
            questions: session.exam.questions,
            participants: participants.map((p) => ({
                participantId: p.id,
                studentId: p.studentId,
                student: p.student,
                submittedAt: p.submittedAt,
                answers: answers
                    .filter((a) => a.studentId === p.studentId)
                    .map((a) => ({
                        answerId: a.id,
                        questionId: a.questionId,
                        questionText: a.question.text,
                        value: a.value,
                        points: a.question.points || 1,
                        awardedPoints: a.awardedPoints ?? null,
                        gradedAt: a.gradedAt ?? null,
                        gradedBy: a.gradedBy ?? null,
                    })),
            })),
        };
    }

    // ── Teacher: grade a short answer and recompute participant score ───────
    async gradeShortAnswer(params: {
        sessionId: string;
        studentId: string;
        questionId: string;
        awardedPoints: number;
        graderId: string;
    }) {
        const { sessionId, studentId, questionId, awardedPoints, graderId } = params;

        if (awardedPoints < 0) {
            throw new BadRequestException('awardedPoints must be >= 0');
        }

        const question = await this.prisma.question.findFirst({
            where: {
                id: questionId,
                type: QuestionType.SHORT_ANSWER,
                exam: { sessions: { some: { id: sessionId } } },
            },
            select: { id: true, points: true },
        });

        if (!question) {
            throw new NotFoundException('Short-answer question not found for this session');
        }

        const maxPoints = question.points || 1;
        const clamped = Math.max(0, Math.min(awardedPoints, maxPoints));

        const updatedAnswer = await this.prisma.answer.upsert({
            where: { sessionId_studentId_questionId: { sessionId, studentId, questionId } },
            update: {
                awardedPoints: clamped,
                gradedAt: new Date(),
                gradedById: graderId,
            },
            create: {
                sessionId,
                studentId,
                questionId,
                value: '',
                awardedPoints: clamped,
                gradedAt: new Date(),
                gradedById: graderId,
            },
        });

        const participant = await this.prisma.sessionParticipant.findUnique({
            where: { sessionId_studentId: { sessionId, studentId } },
            include: {
                session: {
                    include: {
                        exam: { include: { questions: true } },
                    },
                },
                answers: true,
            },
        });

        if (!participant) throw new NotFoundException('Participant not found');

        const totalPoints = participant.session.exam.questions.reduce(
            (sum, q) => sum + (q.points || 1),
            0,
        );
        const earnedPoints = this.calculateEarnedPoints(
            participant.answers,
            participant.session.exam.questions,
        );
        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        await this.prisma.sessionParticipant.update({
            where: { sessionId_studentId: { sessionId, studentId } },
            data: { score: percentage },
        });

        return {
            message: 'Short answer graded',
            answer: updatedAnswer,
            updatedScore: percentage,
            totalPoints,
            earnedPoints,
        };
    }
}
