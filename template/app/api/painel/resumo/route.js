import { requireOwner } from '@/lib/auth';
import { resumoDoPainel } from '@/lib/painel/resumo';
import { erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireOwner();
    return Response.json(await resumoDoPainel());
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
