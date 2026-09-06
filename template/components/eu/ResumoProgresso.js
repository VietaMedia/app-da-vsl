'use client';
import NumeroAnimado from '@/components/ui/NumeroAnimado';
import { t } from '@/lib/i18n';

// Três números lado a lado no topo da tela Eu: dias feitos, sequência,
// semanas. Cada número sobe de 0 até o valor com um count-up de 0.8s.
const TILE = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '14px 12px' };
const ROTULO = { fontSize: 11, fontWeight: 700, color: 'var(--cor-texto-suave)', letterSpacing: '.3px', textTransform: 'uppercase' };

export default function ResumoProgresso({ diasFeitos, streak, semanas, locale = 'pt' }) {
  const itens = [
    { valor: diasFeitos, rotulo: t(locale, 'eu.diasFeitos') },
    { valor: streak, rotulo: t(locale, 'eu.sequencia') },
    { valor: semanas, rotulo: t(locale, 'eu.semanas') },
  ];
  return (
    <div className="card" style={{ display: 'flex', padding: 0 }}>
      {itens.map((item, i) => (
        <div
          key={item.rotulo}
          style={{ ...TILE, borderLeft: i > 0 ? '1px solid var(--cor-linha)' : 'none' }}
        >
          <div className="display" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: 'var(--cor-primaria-escura)' }}>
            <NumeroAnimado valor={item.valor} />
          </div>
          <div style={ROTULO}>{item.rotulo}</div>
        </div>
      ))}
    </div>
  );
}
