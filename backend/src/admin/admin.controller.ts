import { Controller, Get, Delete, Param, HttpException, HttpStatus, UseGuards, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { InitAdminService } from './init-admin';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly initAdminService: InitAdminService
  ) { }

  @Post('init-admin')
  async initAdmin() {
    try {
      await this.initAdminService.createAdminIfNotExists();
      return { message: 'Admin user initialized successfully' };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to initialize admin', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats() {
    try {
      return await this.adminService.getStats();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch admin stats', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getUsers() {
    try {
      return await this.adminService.getUsers();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch users', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createUser(@Body() createUserDto: any) {
    try {
      const result = await this.adminService.createUser(createUserDto);
      return { message: 'User created successfully', data: result };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create user', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteUser(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteUser(id);
      return { message: 'User deleted successfully', data: result };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete user', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('classes')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getClasses() {
    try {
      return await this.adminService.getClasses();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch classes', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('classes/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteClass(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteClass(id);
      return { message: 'Class deleted successfully', data: result };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete class', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('exams')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getExams() {
    try {
      return await this.adminService.getExams();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch exams', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('exams/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteExam(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteExam(id);
      return { message: 'Exam deleted successfully', data: result };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete exam', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getSessions() {
    try {
      return await this.adminService.getSessions();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch sessions', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteSession(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteSession(id);
      return { message: 'Session deleted successfully', data: result };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete session', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
