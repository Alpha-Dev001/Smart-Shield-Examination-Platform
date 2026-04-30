import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  // Create a class
  const classData = await prisma.class.create({
    data: {
      name: 'Computer Science 101',
      joinCode: 'CS101',
      teacherId: teacher.id,
    },
  });

  // Create a student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.create({
    data: {
      email: 'student@school.com',
      password: studentPassword,
      role: 'STUDENT',
      classId: classData.id,
    },
  });

  // Create an exam
  const exam = await prisma.exam.create({
    data: {
      title: 'Introduction to Programming',
      classId: classData.id,
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60, // 60 minutes
    },
  });

  // Create some questions
  await prisma.question.createMany({
    data: [
      {
        examId: exam.id,
        type: 'MCQ',
        text: 'What is the time complexity of binary search?',
        options: JSON.stringify(['O(n)', 'O(log n)', 'O(n^2)', 'O(1)']),
        answer: JSON.stringify('O(log n)'),
      },
      {
        examId: exam.id,
        type: 'TRUE_FALSE',
        text: 'JavaScript is a compiled language.',
        options: JSON.stringify(['True', 'False']),
        answer: JSON.stringify('False'),
      },
      {
        examId: exam.id,
        type: 'SHORT_ANSWER',
        text: 'What does API stand for?',
        answer: JSON.stringify('Application Programming Interface'),
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Teacher login: teacher@school.com / teacher123');
  console.log('Student login: student@school.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
