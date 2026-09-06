import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth';
import { moduloDoTipo, toggleProgress } from '@/lib/modulos/comum';
import { totalItens } from '@/lib/modulos/guias';
import { estadoGuia } from '@/lib/dados/guias';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

function acharGuia(mod, guideKey) {
  return mod.content.guides.find(g => g.key === guideKey);
}

export async function GET(req) {
  try {
    const u = await requireUser();
    const url = new URL(req.url);
    const moduleKey = url.searchParams.get('moduleKey');
    const guideKey = url.searchParams.get('guideKey');
    const mod = await moduloDoTipo(moduleKey, 'guias');
    const guide = acharGuia(mod, guideKey);
    if (!guide) return Response.json({ error: 'guia não encontrado' }, { status: 404 });
    return Response.json(await estadoGuia(u.id, mod, guideKey));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function POST(req) {
  try {
    const u = await requireUser();
    const { moduleKey, guideKey, itemIndex } = await lerJson(req);
    const mod = await moduloDoTipo(moduleKey, 'guias');
    const guide = acharGuia(mod, guideKey);
    if (!guide) return Response.json({ error: 'guia não encontrado' }, { status: 404 });
    const total = totalItens(guide);
    if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= total) {
      return Response.json({ error: 'item inválido' }, { status: 400 });
    }
    await toggleProgress(prisma, { userId: u.id, moduleKey, stepKey: guideKey, itemIndex });
    return Response.json(await estadoGuia(u.id, mod, guideKey));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
