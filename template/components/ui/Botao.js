'use client';
import Link from 'next/link';
import Icone from './Icone';

const VARIANTES = {
  primario: {
    background: 'var(--cor-primaria)',
    color: '#fff',
    boxShadow: 'var(--sombra-primaria)',
  },
  quente: {
    background: 'var(--cor-destaque)',
    color: '#fff',
    boxShadow: 'var(--sombra-destaque)',
  },
  secundario: {
    background: '#fff',
    color: 'var(--cor-texto)',
    border: '1.5px solid var(--cor-linha)',
    boxShadow: 'none',
  },
};

export default function Botao({ variante = 'primario', pequeno = false, href, icone, carregando = false, children, className = '', style, ...props }) {
  const v = VARIANTES[variante] || VARIANTES.primario;
  const baseStyle = {
    height: pequeno ? 46 : 56,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 'var(--raio)',
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '.2px',
    background: v.background,
    color: v.color,
    border: v.border || 'none',
    boxShadow: v.boxShadow,
    textDecoration: 'none',
    cursor: carregando ? 'default' : 'pointer',
    opacity: carregando ? 0.85 : 1,
    ...style,
  };

  const conteudo = carregando ? (
    <span
      aria-hidden
      className="animate-spin"
      style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent' }}
    />
  ) : (
    <>
      {children}
      {icone && <Icone nome={icone} tamanho={20} cor={v.color} traco={2.4} />}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={baseStyle}
        aria-busy={carregando}
        aria-disabled={carregando}
        onClick={e => { if (carregando) e.preventDefault(); }}
      >
        {conteudo}
      </Link>
    );
  }

  return (
    <button className={className} style={baseStyle} disabled={carregando} aria-busy={carregando} {...props}>
      {conteudo}
    </button>
  );
}
