import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    answer: {
      deleteMany: jest.fn(),
    },
    sessionParticipant: {
      deleteMany: jest.fn(),
    },
    proctoringEvent: {
      deleteMany: jest.fn(),
    },
    class: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should allow deletion of teacher users without classes', async () => {
      const teacherId = 'teacher-123';
      const teacherUser = {
        id: teacherId,
        email: 'teacher@example.com',
        role: 'TEACHER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(teacherUser);
      mockPrismaService.answer.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.sessionParticipant.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.proctoringEvent.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.class.findMany.mockResolvedValue([]); // No classes
      mockPrismaService.user.delete.mockResolvedValue(teacherUser);

      const result = await service.deleteUser(teacherId);

      expect(result).toEqual(teacherUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
      });
      expect(mockPrismaService.class.findMany).toHaveBeenCalledWith({
        where: { teacherId }
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: teacherId },
      });
    });

    it('should throw error when trying to delete teacher with classes', async () => {
      const teacherId = 'teacher-123';
      const teacherUser = {
        id: teacherId,
        email: 'teacher@example.com',
        role: 'TEACHER',
      };
      const mockClasses = [
        { id: 'class-1', name: 'Math 101' },
        { id: 'class-2', name: 'Science 202' }
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(teacherUser);
      mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

      await expect(service.deleteUser(teacherId)).rejects.toThrow(
        'Cannot delete teacher with 2 associated classes. Please delete or reassign the classes first, or contact an administrator.'
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
      });
      expect(mockPrismaService.class.findMany).toHaveBeenCalledWith({
        where: { teacherId }
      });
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });

    it('should allow deletion of student users', async () => {
      const studentId = 'student-123';
      const studentUser = {
        id: studentId,
        email: 'student@example.com',
        role: 'STUDENT',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(studentUser);
      mockPrismaService.answer.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.sessionParticipant.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.proctoringEvent.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.user.delete.mockResolvedValue(studentUser);

      const result = await service.deleteUser(studentId);

      expect(result).toEqual(studentUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: studentId },
      });
      expect(mockPrismaService.answer.deleteMany).toHaveBeenCalledWith({
        where: { studentId },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: studentId },
      });
    });

    it('should throw error when user does not exist', async () => {
      const nonExistentId = 'non-existent-123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser(nonExistentId)).rejects.toThrow(
        'User with id non-existent-123 not found'
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });
});
