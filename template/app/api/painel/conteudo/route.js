import { prisma, ensureSchema } from '@/lib/db/prisma';
import { requireOwner } from '@/lib/auth';
import { loadConfig } from '@/lib/config';
import { saveOverride } from '@/lib/content';
import { validarOverride } from '@/lib/painel/validar';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireOwner();
    await ensureSchema();
    const config = loadConfig();
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: 'content:' } } });
    const overrides = Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]));
    return Response.json({ config, overrides });
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function PUT(req) {
  try {
    await requireOwner();
    const { key, value } = await lerJson(req);
    const config = loadConfig();
    const r = validarOverride(config, key, value);
    if (!r.ok) return Response.json({ error: r.erro }, { status: 400 });
    await saveOverride(key, r.value);
    return Response.json({ ok: true });
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function DELETE(req) {
  try {
    await requireOwner();
    await ensureSchema();
    const { key } = await lerJson(req);
    await prisma.setting.deleteMany({ where: { key } });
    return Response.json({ ok: true });
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
