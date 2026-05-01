import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@smesh.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('mu1ne2ze3ro4', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@smesh.com',
        password: adminPassword,
        role: 'ADMIN' as any,
        firstName: 'System',
        lastName: 'Administrator',
      },
    });

    console.log('Admin user created successfully!');
    console.log('Login: admin@smesh.com / mu1ne2ze3ro4');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
