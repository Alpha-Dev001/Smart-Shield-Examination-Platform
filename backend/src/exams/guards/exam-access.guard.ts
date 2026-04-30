import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // teachers bypass this guard
    if (user.role === 'TEACHER') return true;

    const examId = request.params.examId;

    // student must be enrolled
    if (!user.classId) {
      throw new ForbiddenException('You are not enrolled in any class');
    }

    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) throw new NotFoundException('Exam not found');

    // exam must belong to student's class
    if (exam.classId !== user.classId) {
      throw new ForbiddenException(
        'This exam does not belong to your class',
      );
    }

    request.targetExam = exam;
    return true;
  }
}
