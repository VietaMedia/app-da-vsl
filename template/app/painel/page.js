import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth';
import { resumoDoPainel } from '@/lib/painel/resumo';
import Card from '@/components/ui/Card';
export const dynamic = 'force-dynamic';

export default async function PainelResumo() {
  try { await requireOwner(); } catch { redirect('/app'); }
  const { usuarios, ativos, bloqueados, cadastrosUltimos7, usoPorModulo } = await resumoDoPainel();

  const numeros = [
    { label: 'Usuários', valor: usuarios },
    { label: 'Ativos', valor: ativos },
    { label: 'Bloqueados', valor: bloqueados },
    { label: 'Cadastros 7 dias', valor: cadastrosUltimos7 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--cor-texto)' }}>Resumo</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {numeros.map(n => (
          <Card key={n.label}>
            <p className="text-sm" style={{ color: 'var(--cor-texto-suave)' }}>{n.label}</p>
            <p className="display text-3xl font-bold" style={{ color: 'var(--cor-primaria-escura)' }}>{n.valor}</p>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="display mb-2 text-lg font-semibold" style={{ color: 'var(--cor-texto)' }}>Uso por módulo</h2>
        <Card>
          <ul className="divide-y" style={{ borderColor: 'var(--cor-linha)' }}>
            {usoPorModulo.map(m => (
              <li key={m.moduleKey} className="flex items-center justify-between py-2" style={{ borderColor: 'var(--cor-linha)' }}>
                <span style={{ color: 'var(--cor-texto)' }}>{m.title}</span>
                <span className="font-semibold" style={{ color: 'var(--cor-primaria-escura)' }}>{m.eventos}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
