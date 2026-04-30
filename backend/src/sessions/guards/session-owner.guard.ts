import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const sessionId = request.params.sessionId;

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          include: {
            class: { select: { teacherId: true } },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    if (session.exam.class.teacherId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to manage this session',
      );
    }

    request.targetSession = session;
    return true;
  }
}
