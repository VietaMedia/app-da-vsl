import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth';
import { hojeISO } from '@/lib/dates';
import { moduloDoTipo, toggleCheckin } from '@/lib/modulos/comum';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

async function estado(userId, moduleKey) {
  const hoje = hojeISO();
  const rows = await prisma.checkin.findMany({ where: { userId, moduleKey, date: hoje } });
  return { feitosHoje: rows.map(r => r.itemKey) };
}

export async function GET(req) {
  try {
    const u = await requireUser();
    const moduleKey = new URL(req.url).searchParams.get('moduleKey');
    await moduloDoTipo(moduleKey, 'lembretes');
    return Response.json(await estado(u.id, moduleKey));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function POST(req) {
  try {
    const u = await requireUser();
    const { moduleKey, itemKey } = await lerJson(req);
    const mod = await moduloDoTipo(moduleKey, 'lembretes');
    const existe = mod.content.items.some(i => i.key === itemKey);
    if (!existe) return Response.json({ error: 'lembrete não encontrado' }, { status: 400 });
    await toggleCheckin(prisma, { userId: u.id, moduleKey, itemKey, date: hojeISO() });
    return Response.json(await estado(u.id, moduleKey));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
