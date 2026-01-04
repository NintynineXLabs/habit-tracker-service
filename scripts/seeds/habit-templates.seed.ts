import { db } from '../../src/db';
import {
  habitTemplates,
  templateItems,
} from '../../src/modules/habits/habits.schema';

const seedHabitTemplates = async () => {
  console.log('🌱 Seeding habit templates...');

  // 1. Muslim Produktif
  const muslimTemplate = await db
    .insert(habitTemplates)
    .values({
      name: 'Muslim Produktif',
      description: 'Rutinitas harian untuk menjaga produktivitas dan ibadah.',
      category: 'Religi',
      iconName: 'moon',
      iconColor: '#ffffff',
      iconBackgroundColor: '#10b981', // emerald-500
    })
    .returning();

  if (!muslimTemplate[0]) throw new Error('Failed to create Muslim template');
  const muslimTemplateId = muslimTemplate[0].id;

  await db.insert(templateItems).values([
    {
      templateId: muslimTemplateId,
      name: 'Shalat 5 Waktu',
      description: 'Menjaga shalat wajib tepat waktu.',
      category: 'Ibadah',
      iconName: 'moon',
      iconColor: '#ffffff',
      iconBackgroundColor: '#10b981',
    },
    {
      templateId: muslimTemplateId,
      name: 'Shalat Dhuha',
      description: 'Shalat sunnah di pagi hari.',
      category: 'Ibadah',
      iconName: 'sun',
      iconColor: '#ffffff',
      iconBackgroundColor: '#f59e0b', // amber-500
    },
    {
      templateId: muslimTemplateId,
      name: 'Sedekah Subuh',
      description: 'Berbagi rezeki di awal hari.',
      category: 'Sosial',
      iconName: 'heart',
      iconColor: '#ffffff',
      iconBackgroundColor: '#ec4899', // pink-500
    },
    {
      templateId: muslimTemplateId,
      name: 'Baca Al-Quran',
      description: 'Membaca minimal 1 halaman per hari.',
      category: 'Ibadah',
      iconName: 'book',
      iconColor: '#ffffff',
      iconBackgroundColor: '#3b82f6', // blue-500
    },
  ]);

  // 2. Workout Pemula
  const workoutTemplate = await db
    .insert(habitTemplates)
    .values({
      name: 'Workout Pemula',
      description: 'Membangun kebiasaan olahraga ringan untuk pemula.',
      category: 'Kesehatan',
      iconName: 'dumbbell',
      iconColor: '#ffffff',
      iconBackgroundColor: '#ef4444', // red-500
    })
    .returning();

  if (!workoutTemplate[0]) throw new Error('Failed to create Workout template');
  const workoutTemplateId = workoutTemplate[0].id;

  await db.insert(templateItems).values([
    {
      templateId: workoutTemplateId,
      name: 'Jalan Pagi 15 Menit',
      description: 'Jalan santai untuk memanaskan tubuh.',
      category: 'Kesehatan',
      iconName: 'footprints',
      iconColor: '#ffffff',
      iconBackgroundColor: '#f97316', // orange-500
    },
    {
      templateId: workoutTemplateId,
      name: 'Push Up 10x',
      description: 'Latihan kekuatan otot dada dan lengan.',
      category: 'Kesehatan',
      iconName: 'dumbbell',
      iconColor: '#ffffff',
      iconBackgroundColor: '#ef4444',
    },
    {
      templateId: workoutTemplateId,
      name: 'Minum Air 2 Liter',
      description: 'Menjaga hidrasi tubuh sepanjang hari.',
      category: 'Kesehatan',
      iconName: 'droplet',
      iconColor: '#ffffff',
      iconBackgroundColor: '#06b6d4', // cyan-500
    },
  ]);

  // 3. Morning Routine
  const morningTemplate = await db
    .insert(habitTemplates)
    .values({
      name: 'Morning Routine',
      description: 'Awali hari dengan energi positif dan fokus.',
      category: 'Produktivitas',
      iconName: 'sun',
      iconColor: '#ffffff',
      iconBackgroundColor: '#f59e0b', // amber-500
    })
    .returning();

  if (!morningTemplate[0]) throw new Error('Failed to create Morning template');
  const morningTemplateId = morningTemplate[0].id;

  await db.insert(templateItems).values([
    {
      templateId: morningTemplateId,
      name: 'Make Bed',
      description: 'Rapikan tempat tidur setelah bangun.',
      category: 'Produktivitas',
      iconName: 'bed',
      iconColor: '#ffffff',
      iconBackgroundColor: '#6366f1', // indigo-500
    },
    {
      templateId: morningTemplateId,
      name: 'Meditasi 5 Menit',
      description: 'Menenangkan pikiran sebelum memulai aktivitas.',
      category: 'Mental',
      iconName: 'brain',
      iconColor: '#ffffff',
      iconBackgroundColor: '#8b5cf6', // violet-500
    },
    {
      templateId: morningTemplateId,
      name: 'Review To-Do List',
      description: 'Cek jadwal dan prioritas hari ini.',
      category: 'Produktivitas',
      iconName: 'list-todo',
      iconColor: '#ffffff',
      iconBackgroundColor: '#14b8a6', // teal-500
    },
  ]);

  console.log('✅ Seeded habit templates and items!');
  process.exit(0);
};

seedHabitTemplates().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
