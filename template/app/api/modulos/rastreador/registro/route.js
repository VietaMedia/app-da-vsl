import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth';
import { hojeISO, validarData } from '@/lib/dates';
import { moduloDoTipo } from '@/lib/modulos/comum';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';
async function estado(userId, moduleKey) {
  const rows = await prisma.measurement.findMany({ where: { userId, moduleKey }, orderBy: { date: 'desc' } });
  const registros = rows.map(r => ({ date: r.date, value: r.value }));
  const ultimo = registros[0] || null;
  const ultimos7 = registros.slice(0, 7);
  const media7 = ultimos7.length ? Math.round((ultimos7.reduce((s, r) => s + r.value, 0) / ultimos7.length) * 100) / 100 : null;
  return { registros: [...registros].reverse(), ultimo, media7 };
}
export async function GET(req) {
  try {
    const u = await requireUser();
    const moduleKey = new URL(req.url).searchParams.get('moduleKey');
    await moduloDoTipo(moduleKey, 'rastreador');
    return Response.json(await estado(u.id, moduleKey));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
export async function POST(req) {
  try {
    const u = await requireUser();
    const { moduleKey, value, date } = await lerJson(req);
    const mod = await moduloDoTipo(moduleKey, 'rastreador');
    const { min, max } = mod.content.metric;
    if (typeof value !== 'number' || Number.isNaN(value) || value < min || value > max) {
      return Response.json({ error: `valor deve estar entre ${min} e ${max}` }, { status: 400 });
    }
    const hoje = hojeISO();
    if (date !== undefined && !validarData(date, hoje)) return Response.json({ error: 'data inválida' }, { status: 400 });
    const dia = date || hoje;
    await prisma.measurement.upsert({
      where: { userId_moduleKey_date: { userId: u.id, moduleKey, date: dia } },
      update: { value },
      create: { userId: u.id, moduleKey, date: dia, value },
    });
    return Response.json(await estado(u.id, moduleKey));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
