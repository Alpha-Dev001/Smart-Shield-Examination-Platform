import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnrolledGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // only applies to students
    if (user.role === 'TEACHER') return true;

    if (!user.classId) {
      throw new ForbiddenException(
        'You are not enrolled in any class. Use a join code to enroll first.',
      );
    }

    return true;
  }
}