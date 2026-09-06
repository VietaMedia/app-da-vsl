import Link from 'next/link';
import Icone from './Icone';
import Ilustracao from './Ilustracao';

// Server-safe (sem hooks): gradiente da primária, cantos inferiores em --raio-g,
// ilustração de linha translúcida à direita, botão voltar opcional.
export default function Cabecalho({ titulo, subtitulo, rotulo, ilustracao, voltarHref, tamanhoTitulo = 30, children }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(170deg, var(--cor-primaria-escura), var(--cor-primaria))',
        borderRadius: '0 0 var(--raio-g) var(--raio-g)',
        padding: '64px 22px 28px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {ilustracao && (
        <div style={{ position: 'absolute', right: -60, top: 20, opacity: 0.14, pointerEvents: 'none' }}>
          <Ilustracao nome={ilustracao} />
        </div>
      )}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {voltarHref && (
          <Link
            href={voltarHref}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,.14)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: 4,
            }}
          >
            <Icone nome="back" tamanho={22} cor="#fff" traco={2.2} />
          </Link>
        )}
        {rotulo && (
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--cor-destaque)' }}>
            {rotulo}
          </div>
        )}
        {titulo && <div className="display" style={{ fontSize: tamanhoTitulo, fontWeight: 700, lineHeight: 1.05 }}>{titulo}</div>}
        {subtitulo && <div style={{ fontSize: 14, opacity: 0.85 }}>{subtitulo}</div>}
        {children}
      </div>
    </div>
  );
}
