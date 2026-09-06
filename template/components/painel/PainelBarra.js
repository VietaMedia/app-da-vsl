'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Botao from '@/components/ui/Botao';
import { SIMBOLOS } from '@/lib/identidade/simbolos';

const LINKS = [
  { href: '/painel', label: 'Resumo' },
  { href: '/painel/usuarios', label: 'Usuários' },
  { href: '/painel/conteudo', label: 'Conteúdo' },
  { href: '/app', label: 'Ver o app' },
];

function estiloChip(ativo) {
  return {
    padding: '9px 14px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
    fontSize: 13,
    fontWeight: 800,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 44,
    border: `1px solid ${ativo ? 'var(--cor-primaria-escura)' : 'var(--cor-linha)'}`,
    background: ativo ? 'var(--cor-primaria-escura)' : '#fff',
    color: ativo ? '#fff' : 'var(--cor-texto)',
  };
}

export default function PainelBarra({ appName, symbol }) {
  const pathname = usePathname();
  const router = useRouter();
  const s = SIMBOLOS[symbol] || SIMBOLOS.bowl;

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/entrar');
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderBottom: '1px solid var(--cor-linha)',
        background: 'var(--cor-fundo)',
        padding: '12px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: 9,
            background: 'linear-gradient(160deg, var(--cor-primaria) 0%, var(--cor-primaria-escura) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--cor-fundo)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: s.paths }}
          />
        </div>
        <span className="display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--cor-texto)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {appName}
        </span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={estiloChip(pathname === l.href)}>
            {l.label}
          </Link>
        ))}
        <Botao variante="secundario" pequeno onClick={sair} style={{ width: 'auto', padding: '0 16px' }}>
          Sair
        </Botao>
      </nav>
    </header>
  );
}
