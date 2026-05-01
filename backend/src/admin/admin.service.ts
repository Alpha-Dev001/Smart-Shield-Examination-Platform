import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  async getStats() {
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalClasses,
      totalExams,
      totalSessions,
      activeSessions,
      pendingSessions,
      completedSessions
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.class.count(),
      this.prisma.exam.count(),
      this.prisma.session.count(),
      this.prisma.session.count({ where: { status: 'LIVE' } }),
      this.prisma.session.count({ where: { status: 'PENDING' } }),
      this.prisma.session.count({ where: { status: 'ENDED' } })
    ]);

    return {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalClasses,
      totalExams,
      totalSessions,
      activeSessions,
      pendingSessions,
      completedSessions
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createUser(createUserDto: any) {
    try {
      // Check if email is already taken
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      // Prepare user data
      const userData: any = {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      };

      // Add classId only for students and if provided
      if (createUserDto.role === 'STUDENT' && createUserDto.classId) {
        userData.classId = createUserDto.classId;
      }

      // Create user
      const user = await this.prisma.user.create({
        data: userData,
        include: {
          class: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      // First check if user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!userExists) {
        throw new Error(`User with id ${id} not found`);
      }

      // Delete related records first due to foreign key constraints
      await this.prisma.answer.deleteMany({
        where: { studentId: id }
      });

      await this.prisma.sessionParticipant.deleteMany({
        where: { studentId: id }
      });

      await this.prisma.proctoringEvent.deleteMany({
        where: { studentId: id }
      });

      // If user is a teacher, check if they have classes and handle them
      if (userExists.role === 'TEACHER') {
        const teacherClasses = await this.prisma.class.findMany({
          where: { teacherId: id }
        });

        if (teacherClasses.length > 0) {
          throw new Error(
            `Cannot delete teacher with ${teacherClasses.length} associated classes. ` +
            'Please delete or reassign the classes first, or contact an administrator.'
          );
        }
      }

      // Finally delete the user
      return await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getClasses() {
    return this.prisma.class.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            students: true,
            exams: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async deleteClass(id: string) {
    try {
      // First check if class exists
      const classExists = await this.prisma.class.findUnique({
        where: { id }
      });

      if (!classExists) {
        throw new Error(`Class with id ${id} not found`);
      }

      // Get all related exams first
      const exams = await this.prisma.exam.findMany({
        where: { classId: id },
        select: { id: true }
      });

      // Delete all session participants for sessions related to these exams
      const sessions = await this.prisma.session.findMany({
        where: {
          examId: {
            in: exams.map(exam => exam.id)
          }
        },
        select: { id: true }
      });

      if (sessions.length > 0) {
        // Delete session participants
        await this.prisma.sessionParticipant.deleteMany({
          where: {
            sessionId: {
              in: sessions.map(session => session.id)
            }
          }
        });

        // Delete proctoring events
        await this.prisma.proctoringEvent.deleteMany({
          where: {
            sessionId: {
              in: sessions.map(session => session.id)
            }
          }
        });

        // Delete answers for these sessions
        await this.prisma.answer.deleteMany({
          where: {
            sessionId: {
              in: sessions.map(session => session.id)
            }
          }
        });

        // Delete the sessions
        await this.prisma.session.deleteMany({
          where: {
            examId: {
              in: exams.map(exam => exam.id)
            }
          }
        });
      }

      // Delete all questions for these exams
      await this.prisma.question.deleteMany({
        where: {
          examId: {
            in: exams.map(exam => exam.id)
          }
        }
      });

      // Delete the exams
      await this.prisma.exam.deleteMany({
        where: { classId: id }
      });

      // Update students to remove class reference
      await this.prisma.user.updateMany({
        where: { classId: id },
        data: { classId: null }
      });

      // Finally delete the class
      return await this.prisma.class.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  async getExams() {
    return this.prisma.exam.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            questions: true,
            sessions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async deleteExam(id: string) {
    try {
      // First check if exam exists
      const examExists = await this.prisma.exam.findUnique({
        where: { id }
      });

      if (!examExists) {
        throw new Error(`Exam with id ${id} not found`);
      }

      // Get all sessions for this exam
      const sessions = await this.prisma.session.findMany({
        where: { examId: id },
        select: { id: true }
      });

      if (sessions.length > 0) {
        // Delete session participants
        await this.prisma.sessionParticipant.deleteMany({
          where: {
            sessionId: {
              in: sessions.map(session => session.id)
            }
          }
        });

        // Delete proctoring events
        await this.prisma.proctoringEvent.deleteMany({
          where: {
            sessionId: {
              in: sessions.map(session => session.id)
            }
          }
        });

        // Delete answers for these sessions
        await this.prisma.answer.deleteMany({
          where: {
            sessionId: {
              in: sessions.map(session => session.id)
            }
          }
        });

        // Delete the sessions
        await this.prisma.session.deleteMany({
          where: { examId: id }
        });
      }

      // Delete questions
      await this.prisma.question.deleteMany({
        where: { examId: id }
      });

      // Finally delete the exam
      return await this.prisma.exam.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  async getSessions() {
    return this.prisma.session.findMany({
      include: {
        exam: {
          include: {
            class: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
  }

  async deleteSession(id: string) {
    try {
      // First check if session exists
      const sessionExists = await this.prisma.session.findUnique({
        where: { id }
      });

      if (!sessionExists) {
        throw new Error(`Session with id ${id} not found`);
      }

      // Get participants before deleting them for answer cleanup
      const participants = await this.prisma.sessionParticipant.findMany({
        where: { sessionId: id },
        select: { studentId: true }
      });

      // Delete answers for this session
      if (participants.length > 0) {
        await this.prisma.answer.deleteMany({
          where: {
            sessionId: id,
            studentId: {
              in: participants.map(p => p.studentId)
            }
          }
        });
      }

      // Delete session participants
      await this.prisma.sessionParticipant.deleteMany({
        where: { sessionId: id }
      });

      // Delete proctoring events
      await this.prisma.proctoringEvent.deleteMany({
        where: { sessionId: id }
      });

      // Finally delete the session
      return await this.prisma.session.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}
