import { prisma, ensureSchema } from '../db/prisma';
import { getContent } from '../content';

export async function resumoDoPainel() {
  await ensureSchema();
  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [usuarios, ativos, bloqueados, cadastrosUltimos7, { modules }, checkinsPorModulo, medidasPorModulo, progressosPorModulo] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ativo' } }),
    prisma.user.count({ where: { status: 'bloqueado' } }),
    prisma.user.count({ where: { createdAt: { gte: seteDiasAtras } } }),
    getContent(),
    prisma.checkin.groupBy({ by: ['moduleKey'], _count: { _all: true } }),
    prisma.measurement.groupBy({ by: ['moduleKey'], _count: { _all: true } }),
    prisma.progress.groupBy({ by: ['moduleKey'], _count: { _all: true } }),
  ]);

  const contagem = {};
  for (const g of [...checkinsPorModulo, ...medidasPorModulo, ...progressosPorModulo]) {
    contagem[g.moduleKey] = (contagem[g.moduleKey] || 0) + g._count._all;
  }

  const usoPorModulo = modules.map(m => ({ moduleKey: m.key, title: m.title, eventos: contagem[m.key] || 0 }));

  return { usuarios, ativos, bloqueados, cadastrosUltimos7, usoPorModulo };
}
