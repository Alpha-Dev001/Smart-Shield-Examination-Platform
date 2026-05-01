import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InitAdminService {
  constructor(private prisma: PrismaService) {}

  async createAdminIfNotExists() {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.prisma.user.findUnique({
        where: { email: 'admin@smesh.com' }
      });

      if (existingAdmin) {
        console.log('Admin user already exists');
        return existingAdmin;
      }

      // Create admin user
      const adminPassword = await bcrypt.hash('mu1ne2ze3ro4', 10);
      const admin = await this.prisma.user.create({
        data: {
          email: 'admin@smesh.com',
          password: adminPassword,
          role: 'ADMIN' as any, // Type assertion to bypass TypeScript issue
          firstName: 'System',
          lastName: 'Administrator',
        },
      });

      console.log('Admin user created successfully!');
      console.log('Login: admin@smesh.com / mu1ne2ze3ro4');
      return admin;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }
}
