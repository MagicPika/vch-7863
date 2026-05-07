// =====================================================
// 🔧 POST /api/admin/init-db?secret=... — создать таблицы в БД
// =====================================================
// Запустить ОДИН РАЗ после первого деплоя.
// Сам выполнит SQL для создания всех таблиц.
// =====================================================
import { prisma } from '../_lib/prisma.js';
import { parseRequestUrl } from '../_lib/url.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request) {
  const url = parseRequestUrl(req);
  const secret = url.searchParams.get('secret');

  const expectedSecret = process.env.MIGRATION_SECRET || 'vch7863-init-2026';
  if (secret !== expectedSecret) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        hint: 'Добавь ?secret=... с правильным значением',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Создаём таблицы вручную через SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Soldier" (
        "id" TEXT PRIMARY KEY,
        "username" TEXT NOT NULL,
        "displayName" TEXT NOT NULL,
        "avatar" TEXT,
        "rankName" TEXT,
        "divisionCode" TEXT,
        "position" TEXT,
        "joinDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'В СТРОЮ',
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Award" (
        "id" TEXT PRIMARY KEY,
        "soldierId" TEXT NOT NULL REFERENCES "Soldier"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT NOT NULL DEFAULT 'medal',
        "color" TEXT NOT NULL DEFAULT 'amber',
        "awardedBy" TEXT,
        "awardedByName" TEXT,
        "awardedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Warning" (
        "id" TEXT PRIMARY KEY,
        "soldierId" TEXT NOT NULL REFERENCES "Soldier"("id") ON DELETE CASCADE,
        "type" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "issuedBy" TEXT,
        "issuedByName" TEXT,
        "issuedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "removedAt" TIMESTAMP,
        "removedBy" TEXT,
        "removedByName" TEXT
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RankChange" (
        "id" TEXT PRIMARY KEY,
        "soldierId" TEXT NOT NULL REFERENCES "Soldier"("id") ON DELETE CASCADE,
        "fromRank" TEXT,
        "toRank" TEXT NOT NULL,
        "reason" TEXT,
        "changedBy" TEXT,
        "changedByName" TEXT,
        "changedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Diploma" (
        "id" TEXT PRIMARY KEY,
        "soldierId" TEXT NOT NULL REFERENCES "Soldier"("id") ON DELETE CASCADE,
        "title" TEXT NOT NULL,
        "number" TEXT,
        "description" TEXT,
        "issuedBy" TEXT,
        "issuedByName" TEXT,
        "issuedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return new Response(
      JSON.stringify({
        ok: true,
        message: '✅ Таблицы успешно созданы! Теперь можно пользоваться.',
        tables: ['Soldier', 'Award', 'Warning', 'RankChange', 'Diploma'],
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('Init DB error:', e);
    return new Response(
      JSON.stringify({
        error: 'Ошибка при создании таблиц',
        details: e.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
