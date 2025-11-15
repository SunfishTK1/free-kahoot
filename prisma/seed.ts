import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      planType: 'FREE',
    },
  });

  // Create some sample quizzes
  const sampleQuiz = await prisma.quiz.create({
    data: {
      id: 'sample-quiz-1',
      ownerId: demoUser.id,
      title: 'Sample Math Quiz',
      description: 'A basic math quiz for demonstration',
      status: 'PUBLISHED',
      questions: {
        create: [
          {
            id: 'sample-q1',
            prompt: 'What is 2 + 2?',
            type: 'MC_SINGLE',
            timeLimit: 20,
            points: 1000,
            orderIndex: 0,
            options: {
              create: [
                { label: '3', isCorrect: false },
                { label: '4', isCorrect: true },
                { label: '5', isCorrect: false },
                { label: '6', isCorrect: false },
              ],
            },
          },
          {
            id: 'sample-q2',
            prompt: 'What is 10 × 5?',
            type: 'MC_SINGLE',
            timeLimit: 20,
            points: 1000,
            orderIndex: 1,
            options: {
              create: [
                { label: '45', isCorrect: false },
                { label: '50', isCorrect: true },
                { label: '55', isCorrect: false },
                { label: '60', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Demo user and sample quiz created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
