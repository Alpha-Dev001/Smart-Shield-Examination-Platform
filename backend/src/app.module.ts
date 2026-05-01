import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { ExamsModule } from './exams/exams.module';
import { SessionsModule } from './sessions/sessions.module';
import { ResultsModule } from './results/results.module';
import { ProctoringModule } from './proctoring/proctoring.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClassesModule,
    ExamsModule,
    SessionsModule,
    ResultsModule,
    ProctoringModule,
    AdminModule,
  ],
})
export class AppModule { }