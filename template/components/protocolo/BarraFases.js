import { t } from '@/lib/i18n';

// Barra de fases do protocolo: um segmento por fase, largura proporcional ao
// número de dias. Fase concluída preenche inteira na primária; a fase atual
// mostra o progresso dentro dela em destaque; fases futuras ficam neutras.
export default function BarraFases({ fases, diaAtual, locale = 'pt' }) {
  const totalDias = fases.reduce((soma, fase) => soma + (fase.to - fase.from + 1), 0);
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {fases.map((fase, i) => {
        const dias = fase.to - fase.from + 1;
        const feita = diaAtual > fase.to;
        const atual = diaAtual >= fase.from && diaAtual <= fase.to;
        const pct = atual ? Math.round((100 * (diaAtual - fase.from + 1)) / dias) : 0;
        const rotulo = dias / totalDias >= 0.25
          ? t(locale, 'protocolo.faseNDias', { n: i + 1, n2: dias })
          : t(locale, 'protocolo.faseN', { n: i + 1 });
        return (
          <div key={fase.key} style={{ flex: `${dias} 1 0`, minWidth: fases.length > 3 ? 40 : 64, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 8, borderRadius: 4, background: feita ? 'var(--cor-primaria)' : 'var(--cor-superficie)', position: 'relative', overflow: 'hidden' }}>
              {atual && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: 'var(--cor-destaque)', borderRadius: 4 }} />
              )}
            </div>
            <div
              style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '.4px',
                color: atual ? 'var(--cor-primaria)' : 'var(--cor-texto-suave)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {rotulo}
            </div>
          </div>
        );
      })}
    </div>
  );
}
