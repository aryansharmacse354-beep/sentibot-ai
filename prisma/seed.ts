import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.create({
    data: {
      status: 'active',
      messages: {
        create: [
          {
            role: 'bot',
            content: 'Hello! Welcome to SentiBot AI Help-Desk Portal.',
            sentiment: 'neutral',
            confidence: 0.95,
          },
        ],
      },
    },
  });

  console.log('Seeded database with initial session ID:', session.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
