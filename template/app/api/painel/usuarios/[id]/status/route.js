import { prisma, ensureSchema } from '@/lib/db/prisma';
import { requireOwner } from '@/lib/auth';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  try {
    const dono = await requireOwner();
    await ensureSchema();
    const { id } = await params;
    const userId = Number(id);
    const { status } = await lerJson(req);
    if (status !== 'ativo' && status !== 'bloqueado') {
      return Response.json({ error: 'status inválido' }, { status: 400 });
    }
    if (userId === dono.id) {
      return Response.json({ error: 'não é possível bloquear o próprio dono' }, { status: 403 });
    }
    const alvo = await prisma.user.findUnique({ where: { id: userId } });
    if (!alvo) return Response.json({ error: 'usuário não encontrado' }, { status: 404 });
    const atualizado = await prisma.user.update({ where: { id: userId }, data: { status }, select: { id: true, email: true, status: true } });
    return Response.json(atualizado);
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
