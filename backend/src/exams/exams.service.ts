import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateExamDto,
    UpdateExamDto,
    CreateQuestionDto,
    UpdateQuestionDto,
} from './dto';
import { QuestionType } from '@prisma/client';

@Injectable()
export class ExamsService {
    constructor(private prisma: PrismaService) { }

    // ── Validate answer matches question type ────────────────────────────
    private validateAnswer(type: QuestionType, answer: any, options?: string[]) {
        if (type === QuestionType.MCQ) {
            if (!options || options.length < 2) {
                throw new BadRequestException(
                    'MCQ questions must have at least 2 options',
                );
            }
            if (!options.includes(answer)) {
                throw new BadRequestException(
                    'MCQ answer must be one of the provided options',
                );
            }
        }

        if (type === QuestionType.TRUE_FALSE) {
            if (answer !== true && answer !== false) {
                throw new BadRequestException(
                    'TRUE_FALSE answer must be true or false',
                );
            }
        }

        if (type === QuestionType.SHORT_ANSWER) {
            if (typeof answer !== 'string' || answer.trim().length === 0) {
                throw new BadRequestException(
                    'SHORT_ANSWER must have a non-empty string answer',
                );
            }
        }
    }

    // ── Create exam (teacher only) ───────────────────────────────────────
    async createExam(teacherId: string, classId: string, dto: CreateExamDto) {
        // verify teacher owns this class
        const cls = await this.prisma.class.findFirst({
            where: { id: classId, teacherId },
        });

        if (!cls) {
            throw new NotFoundException(
                'Class not found or you do not own this class',
            );
        }

        // startAt must be in the future
        if (new Date(dto.startAt) <= new Date()) {
            throw new BadRequestException('Exam start time must be in the future');
        }

        const exam = await this.prisma.exam.create({
            data: {
                title: dto.title,
                classId,
                startAt: new Date(dto.startAt),
                duration: dto.duration,
                randomize: dto.randomize ?? false,
            },
            include: {
                class: { select: { id: true, name: true } },
                _count: { select: { questions: true } },
            },
        });

        return exam;
    }

    // ── Get all exams in a class (teacher) ───────────────────────────────
    async getExamsByClass(teacherId: string, classId: string) {
        const cls = await this.prisma.class.findFirst({
            where: { id: classId, teacherId },
        });

        if (!cls) throw new NotFoundException('Class not found');

        return this.prisma.exam.findMany({
            where: { classId },
            include: {
                _count: { select: { questions: true, sessions: true } },
            },
            orderBy: { startAt: 'desc' },
        });
    }

    // ── Get single exam with questions (teacher) ─────────────────────────
    async getExamById(examId: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
                class: { select: { id: true, name: true } },
                _count: { select: { sessions: true } },
            },
        });

        if (!exam) throw new NotFoundException('Exam not found');
        return exam;
    }

    // ── Get exam for student (hides correct answers) ─────────────────────
    async getExamForStudent(examId: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: {
                questions: {
                    select: {
                        id: true,
                        type: true,
                        text: true,
                        options: true,
                        order: true,
                        // answer is intentionally excluded
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!exam) throw new NotFoundException('Exam not found');
        return exam;
    }

    // ── Update exam ──────────────────────────────────────────────────────
    async updateExam(examId: string, dto: UpdateExamDto) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) throw new NotFoundException('Exam not found');

        if (dto.startAt && new Date(dto.startAt) <= new Date()) {
            throw new BadRequestException('Exam start time must be in the future');
        }

        return this.prisma.exam.update({
            where: { id: examId },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.startAt && { startAt: new Date(dto.startAt) }),
                ...(dto.duration && { duration: dto.duration }),
                ...(dto.randomize !== undefined && { randomize: dto.randomize }),
            },
        });
    }

    // ── Delete exam ──────────────────────────────────────────────────────
    async deleteExam(examId: string) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) throw new NotFoundException('Exam not found');

        await this.prisma.exam.delete({ where: { id: examId } });
        return { message: 'Exam deleted successfully' };
    }

    // ── Add question to exam ─────────────────────────────────────────────
    async addQuestion(examId: string, dto: CreateQuestionDto) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) throw new NotFoundException('Exam not found');

        // validate answer matches question type
        this.validateAnswer(dto.type, dto.answer, dto.options);

        // auto-assign order if not provided
        const lastQuestion = await this.prisma.question.findFirst({
            where: { examId },
            orderBy: { order: 'desc' },
        });

        const order = dto.order ?? (lastQuestion ? lastQuestion.order + 1 : 0);

        return this.prisma.question.create({
            data: {
                examId,
                type: dto.type,
                text: dto.text,
                options: dto.options ?? null,
                answer: dto.answer,
                order,
                points: dto.points ?? 1,
                explanation: dto.explanation ?? null,
            },
        });
    }

    // ── Update question ──────────────────────────────────────────────────
    async updateQuestion(examId: string, questionId: string, dto: UpdateQuestionDto) {
        const question = await this.prisma.question.findFirst({
            where: { id: questionId, examId },
        });

        if (!question) throw new NotFoundException('Question not found');

        return this.prisma.question.update({
            where: { id: questionId },
            data: {
                ...(dto.text && { text: dto.text }),
                ...(dto.options && { options: dto.options }),
                ...(dto.answer !== undefined && { answer: dto.answer }),
                ...(dto.order !== undefined && { order: dto.order }),
                ...(dto.points !== undefined && { points: dto.points }),
                ...(dto.explanation !== undefined && { explanation: dto.explanation }),
            },
        });
    }

    // ── Delete question ──────────────────────────────────────────────────
    async deleteQuestion(examId: string, questionId: string) {
        const question = await this.prisma.question.findFirst({
            where: { id: questionId, examId },
        });

        if (!question) throw new NotFoundException('Question not found');

        await this.prisma.question.delete({ where: { id: questionId } });
        return { message: 'Question deleted successfully' };
    }

    // ── Get all questions in exam (teacher) ──────────────────────────────
    async getQuestions(examId: string) {
        return this.prisma.question.findMany({
            where: { examId },
            orderBy: { order: 'asc' },
        });
    }
}
