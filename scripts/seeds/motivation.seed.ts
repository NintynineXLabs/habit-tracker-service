import { db } from '../../src/db';
import { motivationalMessages } from '../../src/modules/motivation/motivation.schema';

const seedMotivationalMessages = async () => {
  console.log('🌱 Seeding motivational messages...');

  const messages = [
    // 0% (Not Started)
    {
      message: "New day, new energy. Let's start!",
      minPercentage: 0,
      maxPercentage: 0,
      isActive: true,
    },
    {
      message: "A small step is better than no step. Let's go!",
      minPercentage: 0,
      maxPercentage: 0,
      isActive: true,
    },
    {
      message: "Don't procrastinate, your goals are waiting.",
      minPercentage: 0,
      maxPercentage: 0,
      isActive: true,
    },

    // 1% - 25% (Just Started)
    {
      message: 'Great start! Keep it moving.',
      minPercentage: 1,
      maxPercentage: 25,
      isActive: true,
    },
    {
      message: 'Momentum is building up. Keep going!',
      minPercentage: 1,
      maxPercentage: 25,
      isActive: true,
    },

    // 26% - 50% (Making Progress)
    {
      message: 'You are on the right track.',
      minPercentage: 26,
      maxPercentage: 50,
      isActive: true,
    },
    {
      message: 'Solid progress for today.',
      minPercentage: 26,
      maxPercentage: 50,
      isActive: true,
    },

    // 51% - 80% (Over the Hump)
    {
      message: 'Awesome! You are more than halfway there.',
      minPercentage: 51,
      maxPercentage: 80,
      isActive: true,
    },
    {
      message: "Just a bit more! Don't slow down.",
      minPercentage: 51,
      maxPercentage: 80,
      isActive: true,
    },

    // 81% - 99% (Almost There)
    {
      message: 'Almost at the finish line! One last push.',
      minPercentage: 81,
      maxPercentage: 99,
      isActive: true,
    },
    {
      message: 'Victory is in sight for today.',
      minPercentage: 81,
      maxPercentage: 99,
      isActive: true,
    },

    // 100% (Completed)
    {
      message: 'Perfect! You conquered the day.',
      minPercentage: 100,
      maxPercentage: 100,
      isActive: true,
    },
    {
      message: 'Outstanding! You earned your rest.',
      minPercentage: 100,
      maxPercentage: 100,
      isActive: true,
    },
    {
      message: 'Consistency is key, and you nailed it!',
      minPercentage: 100,
      maxPercentage: 100,
      isActive: true,
    },
  ];

  await db.insert(motivationalMessages).values(messages);

  console.log(`✅ Seeded ${messages.length} motivational messages!`);
  process.exit(0);
};

seedMotivationalMessages().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
