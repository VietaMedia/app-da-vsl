import { prisma } from '@/lib/db/prisma';

// Últimas N notas do diário de uma linha, mais recente primeiro.
export async function notasRecentes(userId, limite = 14) {
  const rows = await prisma.note.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limite,
  });
  return rows.map(r => ({ date: r.date, text: r.text }));
}

// Upsert da nota do dia (uma por usuário por data — @@unique([userId, date])).
export async function salvarNota(userId, date, text) {
  await prisma.note.upsert({
    where: { userId_date: { userId, date } },
    update: { text },
    create: { userId, date, text },
  });
}
