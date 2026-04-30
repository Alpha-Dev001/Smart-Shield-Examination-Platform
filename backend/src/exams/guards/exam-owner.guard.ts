import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExamOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const examId = request.params.examId;

    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: { select: { teacherId: true } },
      },
    });

    if (!exam) throw new NotFoundException('Exam not found');

    if (exam.class.teacherId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this exam',
      );
    }

    // attach exam to request so service skips a second DB call
    request.targetExam = exam;
    return true;
  }
}
