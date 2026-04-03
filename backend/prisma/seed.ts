import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean slate
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'demo@taskwell.io',
      name: 'Alex Rivera',
      passwordHash,
    },
  });

  console.log(`✓ Created user: ${user.email}`);

  // Create demo tasks
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const tasks = [
    {
      title: 'Review Q4 product roadmap',
      description: 'Go through the proposed features for Q4, prioritise with the team, and prepare a summary for the stakeholder meeting.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: tomorrow,
    },
    {
      title: 'Update API documentation',
      description: 'Document new endpoints added in the latest release including the toggle and filter endpoints.',
      status: 'PENDING' as const,
      priority: 'MEDIUM' as const,
      dueDate: nextWeek,
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment to staging on every pull request.',
      status: 'PENDING' as const,
      priority: 'HIGH' as const,
      dueDate: nextWeek,
    },
    {
      title: 'Write unit tests for auth module',
      description: 'Cover registration, login, token refresh, and logout flows with Jest.',
      status: 'COMPLETED' as const,
      priority: 'HIGH' as const,
      dueDate: lastWeek,
    },
    {
      title: 'Design new onboarding flow',
      description: 'Sketch wireframes for the improved user onboarding experience.',
      status: 'IN_PROGRESS' as const,
      priority: 'MEDIUM' as const,
      dueDate: nextWeek,
    },
    {
      title: 'Migrate legacy database schema',
      description: 'Run migration scripts and verify data integrity in staging before production.',
      status: 'PENDING' as const,
      priority: 'HIGH' as const,
      dueDate: yesterday,
    },
    {
      title: 'Conduct accessibility audit',
      description: 'Run axe-core and manual keyboard navigation tests on all main pages.',
      status: 'PENDING' as const,
      priority: 'MEDIUM' as const,
      dueDate: nextWeek,
    },
    {
      title: 'Refactor authentication middleware',
      description: 'Extract token refresh logic into a reusable interceptor.',
      status: 'COMPLETED' as const,
      priority: 'LOW' as const,
      dueDate: lastWeek,
    },
    {
      title: 'Draft engineering blog post',
      description: 'Write about the JWT token rotation strategy we implemented.',
      status: 'PENDING' as const,
      priority: 'LOW' as const,
      dueDate: null,
    },
    {
      title: 'Performance profiling session',
      description: 'Profile API response times and identify bottlenecks in task list queries.',
      status: 'PENDING' as const,
      priority: 'MEDIUM' as const,
      dueDate: nextWeek,
    },
    {
      title: 'Fix mobile navigation bug',
      description: 'Hamburger menu does not close after navigation on iOS Safari.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: tomorrow,
    },
    {
      title: 'Update dependencies',
      description: 'Run npm audit and update all packages with security vulnerabilities.',
      status: 'COMPLETED' as const,
      priority: 'MEDIUM' as const,
      dueDate: lastWeek,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, userId: user.id } });
  }

  console.log(`✓ Created ${tasks.length} tasks`);
  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────');
  console.log('Demo credentials:');
  console.log('  Email:    demo@taskwell.io');
  console.log('  Password: password123');
  console.log('─────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
