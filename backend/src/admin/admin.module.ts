import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { InitAdminService } from './init-admin';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard, InitAdminService],
  exports: [AdminService]
})
export class AdminModule { }
