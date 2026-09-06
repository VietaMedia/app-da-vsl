import Link from 'next/link';
import Icone from '@/components/ui/Icone';
import { t } from '@/lib/i18n';

const ICONE_POR_KIND = { lista: 'cart', receita: 'bowl', passos: 'clock', texto: 'note', audio: 'play', pagina: 'book' };
const BG_POR_KIND = {
  lista: 'rgba(var(--cor-primaria-rgb), .12)',
  receita: 'rgba(var(--cor-destaque-rgb), .14)',
  passos: 'var(--cor-superficie)',
  texto: 'rgba(var(--cor-primaria-rgb), .12)',
  audio: 'rgba(var(--cor-destaque-rgb), .14)',
  pagina: 'var(--cor-superficie)',
};
const COR_POR_KIND = {
  lista: 'var(--cor-primaria)', receita: 'var(--cor-destaque)', passos: 'var(--cor-texto-suave)',
  texto: 'var(--cor-primaria)', audio: 'var(--cor-destaque)', pagina: 'var(--cor-texto-suave)',
};

function Pill({ children }) {
  return (
    <div style={{ padding: '6px 10px', borderRadius: 999, background: 'var(--cor-superficie)', fontSize: 12, fontWeight: 800, color: 'var(--cor-texto-suave)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', minWidth: 0 }}>
      {children}
    </div>
  );
}

function pillDoGuia(guia, locale) {
  if (guia.kind === 'lista') return t(locale, 'kit.nDeN', { n: guia.marcados, total: guia.total });
  if (guia.kind === 'receita') return guia.time;
  if (guia.kind === 'texto') return t(locale, guia.totalBlocos === 1 ? 'kit.nTextos' : 'kit.nTextos', { n: guia.totalBlocos, s: guia.totalBlocos === 1 ? '' : 's' });
  if (guia.kind === 'audio') return t(locale, 'kit.nAudios', { n: guia.totalFaixas, s: guia.totalFaixas === 1 ? '' : 's' });
  if (guia.kind === 'pagina') return t(locale, guia.totalSecoesPagina === 1 ? 'kit.nSecao' : 'kit.nSecoes', { n: guia.totalSecoesPagina });
  return t(locale, 'kit.nPassos', { n: guia.totalPassos });
}

// Cartões da capa do Kit: um por guia, ícone por tipo, intro em duas linhas e
// uma pílula à direita com o resumo (progresso, tempo ou nº de passos).
export default function ListaGuias({ guias, locale = 'pt' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {guias.map(guia => (
        <Link
          key={guia.key}
          href={`/app/kit/${guia.key}`}
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, textDecoration: 'none', color: 'inherit' }}
        >
          <div style={{ width: 46, height: 46, borderRadius: 14, background: BG_POR_KIND[guia.kind], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icone nome={ICONE_POR_KIND[guia.kind]} tamanho={22} cor={COR_POR_KIND[guia.kind]} traco={1.9} />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 800, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{guia.title}</div>
            {guia.intro && (
              <div style={{
                fontSize: 15, color: 'var(--cor-texto-suave)',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {guia.intro}
              </div>
            )}
            <div style={{ marginTop: 2, display: 'flex', minWidth: 0 }}>
              <Pill>{pillDoGuia(guia, locale)}</Pill>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
