import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth';
import { hojeISO } from '@/lib/dates';
import { computeStreak, diaAtualComInicio, validarItem, podeMarcarDia } from '@/lib/modulos/protocolo';
import { moduloDoTipo, toggleCheckin } from '@/lib/modulos/comum';
import { getPerfil } from '@/lib/dados/perfil';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';
async function estado(userId, moduleKey, mod) {
  const [perfil, rows] = await Promise.all([
    getPerfil(userId),
    prisma.checkin.findMany({ where: { userId, moduleKey }, orderBy: { date: 'asc' } }),
  ]);
  const dates = [...new Set(rows.map(r => r.date))];
  const diaAtualNum = diaAtualComInicio(perfil?.startDate || null, dates[0] || null, hojeISO(), mod.content.days.length);
  return { checkins: rows.map(r => ({ itemKey: r.itemKey, date: r.date })), streak: computeStreak(dates, hojeISO()), diaAtual: diaAtualNum };
}
export async function GET(req) {
  try {
    const u = await requireUser();
    const moduleKey = new URL(req.url).searchParams.get('moduleKey');
    const mod = await moduloDoTipo(moduleKey, 'protocolo');
    return Response.json(await estado(u.id, moduleKey, mod));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
export async function POST(req) {
  try {
    const u = await requireUser();
    const { moduleKey, day, taskIndex } = await lerJson(req);
    const mod = await moduloDoTipo(moduleKey, 'protocolo');
    const v = validarItem(mod, day, taskIndex);
    if (!v.ok) return Response.json({ error: v.erro }, { status: 400 });

    const [perfil, rows] = await Promise.all([
      getPerfil(u.id),
      prisma.checkin.findMany({ where: { userId: u.id, moduleKey }, orderBy: { date: 'asc' } }),
    ]);
    const diaAtualNum = diaAtualComInicio(perfil?.startDate || null, rows[0]?.date || null, hojeISO(), mod.content.days.length);
    if (!podeMarcarDia(day, diaAtualNum)) return Response.json({ error: 'esse dia ainda não chegou' }, { status: 400 });

    const itemKey = `d${day}-t${taskIndex}`, date = hojeISO();
    await toggleCheckin(prisma, { userId: u.id, moduleKey, itemKey, date });
    return Response.json(await estado(u.id, moduleKey, mod));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
