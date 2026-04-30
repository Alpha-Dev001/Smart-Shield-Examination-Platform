import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // teachers bypass this guard
    if (user.role === 'TEACHER') return true;

    const sessionId = request.params.sessionId || request.query.sessionId;

    if (!user.classId) {
      throw new ForbiddenException('You are not enrolled in any class');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        exam: { select: { classId: true } },
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    if (session.exam.classId !== user.classId) {
      throw new ForbiddenException(
        'These results do not belong to your class',
      );
    }

    return true;
  }
}
