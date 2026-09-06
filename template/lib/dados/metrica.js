import { prisma } from '@/lib/db/prisma';

// Estado de um módulo rastreador pra tela Hoje: último registro, os últimos 30
// (em ordem crescente) e a variação desde o primeiro registro. Query limitada
// (take: 30) em vez de trazer o histórico inteiro pra memória.
export async function estadoMetrica(userId, mod, goal) {
  const moduleKey = mod.key;
  const recentes = await prisma.measurement.findMany({
    where: { userId, moduleKey },
    orderBy: { date: 'desc' },
    take: 30,
  });
  const registros = recentes.map(r => ({ date: r.date, value: r.value })).reverse();
  const ultimo = registros.length ? registros[registros.length - 1] : null;
  let deltaDesdeInicio = null;
  if (ultimo) {
    const primeiro = await prisma.measurement.findFirst({
      where: { userId, moduleKey },
      orderBy: { date: 'asc' },
    });
    deltaDesdeInicio = Math.round((ultimo.value - primeiro.value) * 100) / 100;
  }
  return { ultimo, registros, deltaDesdeInicio, goal };
}
