import {
    ConflictException,
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, JoinClassDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) { }

    // ── Generate unique join code ────────────────────────────────────────
    private generateJoinCode(): string {
        // 8 character uppercase alphanumeric code e.g. "A3FX92BK"
        return randomBytes(4).toString('hex').toUpperCase();
    }

    // ── Create class (teacher only) ──────────────────────────────────────
    async createClass(teacherId: string, dto: CreateClassDto) {
        // generate a unique join code — retry if collision (extremely rare)
        let joinCode: string = '';
        let isUnique = false;

        while (!isUnique) {
            joinCode = this.generateJoinCode();
            const existing = await this.prisma.class.findUnique({
                where: { joinCode },
            });
            if (!existing) isUnique = true;
        }

        const newClass = await this.prisma.class.create({
            data: {
                name: dto.name,
                joinCode,
                teacherId,
            },
            include: {
                teacher: {
                    select: { id: true, email: true },
                },
                _count: {
                    select: { students: true },
                },
            },
        });

        return newClass;
    }

    // ── Get all classes for a teacher ────────────────────────────────────
    async getMyClasses(teacherId: string) {
        return this.prisma.class.findMany({
            where: { teacherId },
            include: {
                _count: {
                    select: { students: true, exams: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ── Get single class with students ───────────────────────────────────
    async getClassById(classId: string, teacherId: string) {
        const cls = await this.prisma.class.findFirst({
            where: { id: classId, teacherId },
            include: {
                students: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true,
                    },
                },
                exams: {
                    select: {
                        id: true,
                        title: true,
                        startAt: true,
                        duration: true,
                    },
                    orderBy: { startAt: 'desc' },
                },
                _count: {
                    select: { students: true },
                },
            },
        });

        if (!cls) throw new NotFoundException('Class not found');
        return cls;
    }

    // ── Join class (student only) ────────────────────────────────────────
    async joinClass(studentId: string, dto: JoinClassDto) {
        // 1. check student isn't already in a class
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
        });

        if (student.classId) {
            throw new ConflictException(
                'You are already enrolled in a class. Leave your current class before joining a new one.',
            );
        }

        // 2. find the class by join code
        const targetClass = await this.prisma.class.findUnique({
            where: { joinCode: dto.joinCode },
        });

        if (!targetClass) {
            throw new NotFoundException('Invalid join code. Please check and try again.');
        }

        // 3. enroll the student
        const updated = await this.prisma.user.update({
            where: { id: studentId },
            data: { classId: targetClass.id },
            select: {
                id: true,
                email: true,
                classId: true,
                class: {
                    select: {
                        id: true,
                        name: true,
                        teacher: {
                            select: { id: true, email: true },
                        },
                    },
                },
            },
        });

        return {
            message: `Successfully joined class: ${targetClass.name}`,
            class: updated.class,
        };
    }

    // ── Leave class (student only) ───────────────────────────────────────
    async leaveClass(studentId: string) {
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
        });

        if (!student.classId) {
            throw new BadRequestException('You are not enrolled in any class.');
        }

        await this.prisma.user.update({
            where: { id: studentId },
            data: { classId: null },
        });

        return { message: 'You have successfully left the class.' };
    }

    // ── Get my enrolled class (student only) ─────────────────────────────
    async getMyClass(studentId: string) {
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
            select: {
                classId: true,
                class: {
                    include: {
                        teacher: {
                            select: { id: true, email: true },
                        },
                        exams: {
                            select: {
                                id: true,
                                title: true,
                                startAt: true,
                                duration: true,
                            },
                            orderBy: { startAt: 'desc' },
                        },
                        _count: {
                            select: { students: true },
                        },
                    },
                },
            },
        });

        if (!student.classId) {
            throw new NotFoundException('You are not enrolled in any class.');
        }

        return student.class;
    }

    // ── Remove student from class (teacher only) ─────────────────────────
    async removeStudent(teacherId: string, classId: string, studentId: string) {
        // verify teacher owns this class
        const cls = await this.prisma.class.findFirst({
            where: { id: classId, teacherId },
        });

        if (!cls) throw new NotFoundException('Class not found');

        // verify student is actually in this class
        const student = await this.prisma.user.findFirst({
            where: { id: studentId, classId },
        });

        if (!student) {
            throw new NotFoundException('Student not found in this class');
        }

        await this.prisma.user.update({
            where: { id: studentId },
            data: { classId: null },
        });

        return { message: 'Student removed from class successfully.' };
    }

    // ── Delete class (teacher only) ──────────────────────────────────────
    async deleteClass(teacherId: string, classId: string) {
        const cls = await this.prisma.class.findFirst({
            where: { id: classId, teacherId },
        });

        if (!cls) throw new NotFoundException('Class not found');

        // unenroll all students first
        await this.prisma.user.updateMany({
            where: { classId },
            data: { classId: null },
        });

        await this.prisma.class.delete({
            where: { id: classId },
        });

        return { message: 'Class deleted successfully.' };
    }
}