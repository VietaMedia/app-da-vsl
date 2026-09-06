import { prisma, ensureSchema } from '@/lib/db/prisma';
import { segredoSessao } from '@/lib/segredo';
export const dynamic = 'force-dynamic';

export async function GET() {
  let sessao = 'ausente';
  try { segredoSessao(); sessao = 'configurada'; } catch { sessao = 'ausente'; }
  try {
    await ensureSchema();
    await prisma.user.count();
    return Response.json({ ok: true, node: process.version, sessao, db: { ok: true } });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, node: process.version, sessao, db: { ok: false, error: 'falha ao conectar ao banco' } }, { status: 503 });
  }
}
