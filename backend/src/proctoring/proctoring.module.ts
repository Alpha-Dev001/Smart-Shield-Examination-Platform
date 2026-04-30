import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProctoringGateway } from './proctoring.gateway';
import { ProctoringService } from './proctoring.service';
import { ProctoringController } from './proctoring.controller';
import { ProctoringOwnerGuard } from './guards';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ProctoringGateway, ProctoringService, ProctoringOwnerGuard],
  controllers: [ProctoringController],
})
export class ProctoringModule {}

