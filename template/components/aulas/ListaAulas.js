import Link from 'next/link';
import Icone from '@/components/ui/Icone';
import { minutosDeLeitura } from '@/lib/aulas-puro';
import { t } from '@/lib/i18n';

function Linha({ href, numero, titulo, minutos, estado, locale = 'pt' }) {
  const bg = estado === 'done' ? 'rgba(var(--cor-primaria-rgb), .10)' : estado === 'cur' ? 'var(--cor-destaque)' : 'var(--cor-superficie)';
  const cor = estado === 'done' ? 'var(--cor-primaria)' : estado === 'cur' ? '#fff' : 'var(--cor-texto-suave)';
  const meta = estado === 'done'
    ? t(locale, 'aulas.minConcluida', { min: minutos })
    : estado === 'cur'
      ? t(locale, 'aulas.minContinuar', { min: minutos })
      : t(locale, 'aulas.minSomente', { min: minutos });
  return (
    <Link
      href={href}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--cor-linha)', textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {estado === 'done' ? (
          <Icone nome="check" tamanho={20} cor={cor} traco={2.4} />
        ) : estado === 'cur' ? (
          <Icone nome="play" tamanho={22} cor={cor} />
        ) : (
          <span style={{ fontWeight: 800, fontSize: 14, color: cor }}>{numero}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: estado === 'done' ? 'var(--cor-texto-suave)' : 'var(--cor-texto)' }}>{titulo}</div>
        <div style={{ fontSize: 12, color: 'var(--cor-texto-suave)' }}>{meta}</div>
      </div>
      <Icone nome="chev" tamanho={18} cor="#C9CFC4" traco={2.2} />
    </Link>
  );
}

// Lista de aulas de uma seção: feita / atual / próxima, seguida do cartão
// "CONTINUAR" apontando pra primeira aula não concluída da seção (quando houver).
export default function ListaAulas({ sectionKey, steps, feitos, locale = 'pt' }) {
  const concluidos = new Set(feitos.filter(f => f.itemIndex === -1).map(f => f.stepKey));
  let curVisto = false;
  const linhas = steps.map((passo, i) => {
    let estado;
    if (concluidos.has(passo.key)) estado = 'done';
    else if (!curVisto) { estado = 'cur'; curVisto = true; }
    else estado = 'next';
    return { passo, numero: i + 1, estado };
  });
  const continuar = linhas.find(l => l.estado === 'cur');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {linhas.map(({ passo, numero, estado }) => (
        <Linha
          key={passo.key}
          href={`/app/aulas/${sectionKey}/${passo.key}`}
          numero={numero}
          titulo={passo.title}
          minutos={minutosDeLeitura(passo.body || '')}
          estado={estado}
          locale={locale}
        />
      ))}
      {continuar && (
        <Link
          href={`/app/aulas/${sectionKey}/${continuar.passo.key}`}
          style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18,
            background: '#fff', border: '1px solid var(--cor-linha)', boxShadow: 'var(--sombra)',
            textDecoration: 'none', color: 'inherit',
          }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--cor-destaque)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icone nome="play" tamanho={26} cor="#fff" traco={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--cor-destaque)', letterSpacing: '.6px' }}>{t(locale, 'aulas.continuar')}</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{continuar.passo.title}</div>
          </div>
        </Link>
      )}
    </div>
  );
}
