import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import EditorConteudo from '@/components/painel/EditorConteudo';
export const dynamic = 'force-dynamic';

export default async function PainelConteudo() {
  try { await requireOwner(); } catch { redirect('/app'); }
  return (
    <div className="space-y-4">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--cor-texto)' }}>Conteúdo</h1>
      <EditorConteudo />
    </div>
  );
}
