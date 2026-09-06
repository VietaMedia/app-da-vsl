import { getContent } from '@/lib/content';

export async function moduloDoTipo(moduleKey, type) {
  const { modules } = await getContent();
  const mod = modules.find(m => m.key === moduleKey && m.type === type);
  if (!mod) throw Response.json({ error: 'módulo não encontrado' }, { status: 404 });
  return mod;
}

export async function toggleCheckin(prisma, { userId, moduleKey, itemKey, date }) {
  try {
    await prisma.checkin.create({ data: { userId, moduleKey, itemKey, date } });
    return { ativo: true };
  } catch (e) {
    if (e && e.code === 'P2002') {
      await prisma.checkin.deleteMany({ where: { userId, moduleKey, itemKey, date } });
      return { ativo: false };
    }
    throw e;
  }
}

export function validarProgresso(mod, stepKey, itemIndex) {
  const passo = mod.content.sections.flatMap(s => s.steps).find(p => p.key === stepKey);
  if (!passo) return { ok: false, erro: 'passo não encontrado' };
  if (!Number.isInteger(itemIndex)) return { ok: false, erro: 'item do checklist inválido' };
  if (itemIndex !== -1 && (itemIndex < 0 || itemIndex >= (passo.checklist || []).length)) {
    return { ok: false, erro: 'item do checklist inválido' };
  }
  return { ok: true };
}

export async function toggleProgress(prisma, { userId, moduleKey, stepKey, itemIndex }) {
  try {
    await prisma.progress.create({ data: { userId, moduleKey, stepKey, itemIndex } });
    return { ativo: true };
  } catch (e) {
    if (e && e.code === 'P2002') {
      await prisma.progress.deleteMany({ where: { userId, moduleKey, stepKey, itemIndex } });
      return { ativo: false };
    }
    throw e;
  }
}
