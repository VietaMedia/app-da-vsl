import { requireUser } from '@/lib/auth';
import { moduloDoTipo } from '@/lib/modulos/comum';
import { contadorHoje, ajustarContador } from '@/lib/dados/contador';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const u = await requireUser();
    const moduleKey = new URL(req.url).searchParams.get('moduleKey');
    const mod = await moduloDoTipo(moduleKey, 'contador');
    return Response.json(await contadorHoje(u.id, mod));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function POST(req) {
  try {
    const u = await requireUser();
    const { moduleKey, delta } = await lerJson(req);
    const mod = await moduloDoTipo(moduleKey, 'contador');
    const step = mod.content.step ?? 1;
    if (delta !== step && delta !== -step) {
      return Response.json({ error: 'delta inválido' }, { status: 400 });
    }
    return Response.json(await ajustarContador(u.id, mod, delta));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
