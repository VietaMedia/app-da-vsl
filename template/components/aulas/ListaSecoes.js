import Link from 'next/link';
import Icone from '@/components/ui/Icone';

// Cartões de seção da capa de Aulas: título, progresso da seção (feitas/total)
// e uma barra fina. Cada cartão leva pra `/app/aulas/[section]`.
export default function ListaSecoes({ secoes }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {secoes.map(secao => {
        const pct = secao.total ? Math.round((100 * secao.feitas) / secao.total) : 0;
        return (
          <Link
            key={secao.key}
            href={`/app/aulas/${secao.key}`}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{secao.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--cor-superficie)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--cor-primaria)', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--cor-texto-suave)', whiteSpace: 'nowrap' }}>
                  {secao.feitas}/{secao.total}
                </div>
              </div>
            </div>
            <Icone nome="chev" tamanho={18} cor="#C9CFC4" traco={2.2} />
          </Link>
        );
      })}
    </div>
  );
}
