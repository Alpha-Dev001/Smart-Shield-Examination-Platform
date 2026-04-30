import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClassOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const classId = request.params.classId;

    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!cls) throw new NotFoundException('Class not found');

    if (cls.teacherId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this class',
      );
    }

    // attach class to request so service doesn't need to fetch it again
    request.targetClass = cls;
    return true;
  }
}