import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { InitAdminService } from './init-admin';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockAdminService = {
    deleteUser: jest.fn(),
  };

  const mockInitAdminService = {
    createAdminIfNotExists: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        {
          provide: InitAdminService,
          useValue: mockInitAdminService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully delete a teacher user without classes', async () => {
      const teacherId = 'teacher-123';
      const deletedTeacher = {
        id: teacherId,
        email: 'teacher@example.com',
        role: 'TEACHER',
      };

      mockAdminService.deleteUser.mockResolvedValue(deletedTeacher);

      const result = await controller.deleteUser(teacherId);

      expect(result).toEqual({
        message: 'User deleted successfully',
        data: deletedTeacher,
      });
      expect(mockAdminService.deleteUser).toHaveBeenCalledWith(teacherId);
    });

    it('should return 500 when trying to delete teacher with classes', async () => {
      const teacherId = 'teacher-123';
      const error = new Error('Cannot delete teacher with 2 associated classes. Please delete or reassign the classes first, or contact an administrator.');

      mockAdminService.deleteUser.mockRejectedValue(error);

      try {
        await controller.deleteUser(teacherId);
        fail('Should have thrown an exception');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          message: 'Failed to delete user',
          error: 'Cannot delete teacher with 2 associated classes. Please delete or reassign the classes first, or contact an administrator.'
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should successfully delete a student user', async () => {
      const studentId = 'student-123';
      const deletedUser = {
        id: studentId,
        email: 'student@example.com',
        role: 'STUDENT',
      };

      mockAdminService.deleteUser.mockResolvedValue(deletedUser);

      const result = await controller.deleteUser(studentId);

      expect(result).toEqual({
        message: 'User deleted successfully',
        data: deletedUser,
      });
      expect(mockAdminService.deleteUser).toHaveBeenCalledWith(studentId);
    });

    it('should return 500 for general errors', async () => {
      const userId = 'user-123';
      const error = new Error('Database connection failed');

      mockAdminService.deleteUser.mockRejectedValue(error);

      try {
        await controller.deleteUser(userId);
        fail('Should have thrown an exception');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          message: 'Failed to delete user',
          error: 'Database connection failed'
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
