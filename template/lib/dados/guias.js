import { prisma } from '@/lib/db/prisma';
import { totalItens } from '@/lib/modulos/guias';

// Estado de marcação de um guia pra um usuário: todos os itens marcados
// (itemIndex >= 0) daquele stepKey (= guide.key). Uma única consulta.
export async function estadoGuia(userId, mod, guideKey) {
  const rows = await prisma.progress.findMany({
    where: { userId, moduleKey: mod.key, stepKey: guideKey, itemIndex: { gte: 0 } },
  });
  return { marcados: rows.map(r => r.itemIndex) };
}

// Resumo de todos os guias de um módulo pra tela /app/kit: uma única consulta
// de progresso, agrupada em memória por guia.
export async function resumoGuias(userId, mod) {
  const rows = await prisma.progress.findMany({
    where: { userId, moduleKey: mod.key, itemIndex: { gte: 0 } },
  });
  const porGuia = new Map();
  for (const r of rows) {
    if (!porGuia.has(r.stepKey)) porGuia.set(r.stepKey, 0);
    porGuia.set(r.stepKey, porGuia.get(r.stepKey) + 1);
  }
  return mod.content.guides.map(guide => ({
    key: guide.key,
    kind: guide.kind,
    title: guide.title,
    intro: guide.intro,
    total: totalItens(guide),
    marcados: porGuia.get(guide.key) || 0,
    time: guide.time,
    totalPassos: guide.kind === 'passos' ? guide.steps.length : undefined,
    totalBlocos: guide.kind === 'texto' ? guide.blocks.length : undefined,
    totalFaixas: guide.kind === 'audio' ? guide.tracks.length : undefined,
    totalSecoesPagina: guide.kind === 'pagina' ? guide.sections.length : undefined,
  }));
}
