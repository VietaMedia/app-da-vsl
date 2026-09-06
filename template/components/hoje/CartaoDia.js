import Anel from '@/components/ui/Anel';
import Icone from '@/components/ui/Icone';
import { t } from '@/lib/i18n';

const cardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  padding: 16,
  background: 'rgba(255,255,255,.1)',
  border: '1px solid rgba(255,255,255,.14)',
  borderRadius: 22,
};

// Cartão translúcido do topo da tela Hoje: o anel de progresso do protocolo,
// a fase atual, o tema da semana e a sequência. Sem protocolo, cai pra um
// resumo da métrica ou pra um estado vazio simpático — nunca quebra.
export default function CartaoDia({ protocolo, metrica, locale = 'pt' }) {
  if (!protocolo) {
    if (metrica?.ultimo) {
      return (
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.8px', color: 'var(--cor-destaque)', textTransform: 'uppercase' }}>
              {metrica.label}
            </div>
            <div className="display" style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>
              {metrica.ultimo.value} <span style={{ fontSize: 14 }}>{metrica.unit}</span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={cardStyle}>
        <div className="display" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{t(locale, 'hoje.programaComecaAqui')}</div>
      </div>
    );
  }

  const { diaAtual, totalDias, faseAtual, temaSemana, streak } = protocolo;
  const streakTexto = streak === 0
    ? t(locale, 'hoje.comeceHoje')
    : streak === 1
      ? t(locale, 'hoje.umDiaSeguido')
      : t(locale, 'hoje.diasSeguidos', { n: streak });

  return (
    <div style={cardStyle}>
      <Anel claro valor={diaAtual} total={totalDias} rotulo={t(locale, 'hoje.deTotal', { total: totalDias })} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {faseAtual && (
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.8px', color: 'var(--cor-destaque)', textTransform: 'uppercase' }}>
            {faseAtual.title}
          </div>
        )}
        {temaSemana && (
          <div className="display" style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.1, color: '#fff' }}>{temaSemana}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff', opacity: 0.9 }}>
          <Icone nome="fire" tamanho={16} cor="var(--cor-destaque)" />
          {streakTexto}
        </div>
      </div>
    </div>
  );
}
