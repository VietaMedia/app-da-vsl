import { requireUser } from '@/lib/auth';
import { hojeISO } from '@/lib/dates';
import { notasRecentes, salvarNota } from '@/lib/dados/diario';
import { validarNota } from '@/lib/diario-puro';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const u = await requireUser();
    return Response.json({ notas: await notasRecentes(u.id, 14) });
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function POST(req) {
  try {
    const u = await requireUser();
    const body = await lerJson(req);
    const v = validarNota(body?.text);
    if (!v.ok) return Response.json({ error: v.erro }, { status: 400 });
    await salvarNota(u.id, hojeISO(), v.texto);
    return Response.json({ notas: await notasRecentes(u.id, 14) });
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
