import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import TabelaUsuarios from '@/components/painel/TabelaUsuarios';
export const dynamic = 'force-dynamic';

export default async function PainelUsuarios() {
  let dono;
  try { dono = await requireOwner(); } catch { redirect('/app'); }
  return (
    <div className="space-y-4">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--cor-texto)' }}>Usuários</h1>
      <TabelaUsuarios donoId={dono.id} />
    </div>
  );
}
