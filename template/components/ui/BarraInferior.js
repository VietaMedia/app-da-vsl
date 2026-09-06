'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icone from './Icone';
import { barraVisivel } from '@/lib/abas';

function abaAtiva(abas, pathname) {
  return abas.reduce((melhor, aba) => {
    if (aba.href === '/app') return pathname === '/app' ? aba : melhor;
    if (!pathname.startsWith(aba.href)) return melhor;
    if (!melhor || aba.href.length > melhor.href.length) return aba;
    return melhor;
  }, null);
}

export default function BarraInferior({ abas }) {
  const pathname = usePathname();
  if (!barraVisivel(pathname)) return null;
  const ativa = abaAtiva(abas, pathname);
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
          maxWidth: 430,
          padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
          background: 'var(--cor-superficie)',
          borderTop: '1px solid var(--cor-linha)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {abas.map(aba => {
          const isAtiva = ativa?.key === aba.key;
          const cor = isAtiva ? 'var(--cor-primaria)' : 'var(--cor-texto-suave)';
          return (
            <Link
              key={aba.key}
              href={aba.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                width: 64, height: 44, justifyContent: 'center', color: cor, textDecoration: 'none',
              }}
            >
              <Icone nome={aba.icone} tamanho={22} cor={cor} traco={isAtiva ? 2.2 : 1.8} />
              <span style={{ fontSize: 11, fontWeight: isAtiva ? 800 : 600, letterSpacing: '.2px' }}>{aba.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
