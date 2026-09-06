import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth';
import { moduloDoTipo, toggleProgress, validarProgresso } from '@/lib/modulos/comum';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

function todosOsPassos(mod) {
  return mod.content.sections.flatMap(s => s.steps);
}

async function estado(userId, moduleKey, mod) {
  const rows = await prisma.progress.findMany({ where: { userId, moduleKey } });
  const feitos = rows.map(r => ({ stepKey: r.stepKey, itemIndex: r.itemIndex }));
  const total = todosOsPassos(mod).length;
  const concluidos = feitos.filter(f => f.itemIndex === -1).length;
  const percentual = total ? Math.round((100 * concluidos) / total) : 0;
  return { feitos, percentual };
}

export async function GET(req) {
  try {
    const u = await requireUser();
    const moduleKey = new URL(req.url).searchParams.get('moduleKey');
    const mod = await moduloDoTipo(moduleKey, 'trilha');
    return Response.json(await estado(u.id, moduleKey, mod));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function POST(req) {
  try {
    const u = await requireUser();
    const { moduleKey, stepKey, itemIndex } = await lerJson(req);
    const mod = await moduloDoTipo(moduleKey, 'trilha');
    const v = validarProgresso(mod, stepKey, itemIndex);
    if (!v.ok) return Response.json({ error: v.erro }, { status: 400 });
    await toggleProgress(prisma, { userId: u.id, moduleKey, stepKey, itemIndex });
    return Response.json(await estado(u.id, moduleKey, mod));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
