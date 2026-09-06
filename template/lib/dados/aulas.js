import { prisma } from '@/lib/db/prisma';
import { proximaAula } from '@/lib/aulas-puro';

// Progresso da trilha (aulas) pra um usuário: total geral, progresso por
// seção e a próxima aula não concluída (em ordem, cruzando seções). Uma
// única consulta ao progress; o resto é derivado em memória.
export async function progressoTrilha(userId, mod) {
  const rows = await prisma.progress.findMany({ where: { userId, moduleKey: mod.key } });
  const feitos = rows.map(r => ({ stepKey: r.stepKey, itemIndex: r.itemIndex }));
  const concluidos = new Set(feitos.filter(f => f.itemIndex === -1).map(f => f.stepKey));

  const porSecao = mod.content.sections.map(secao => ({
    key: secao.key,
    title: secao.title,
    total: secao.steps.length,
    feitas: secao.steps.filter(p => concluidos.has(p.key)).length,
  }));

  return {
    total: porSecao.reduce((s, x) => s + x.total, 0),
    feitas: porSecao.reduce((s, x) => s + x.feitas, 0),
    porSecao,
    proximaAula: proximaAula(mod, feitos),
    feitos,
  };
}
