import { prisma, ensureSchema } from '@/lib/db/prisma';
import { requireOwner } from '@/lib/auth';
import { erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireOwner();
    await ensureSchema();
    const usuarios = await prisma.user.findMany({
      select: { id: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return Response.json(usuarios);
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
