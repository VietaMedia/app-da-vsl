import Markdown from '@/components/ui/Markdown';
import Cronometro from '@/components/kit/Cronometro';

// Guia tipo "passos": um cartão por passo (numeração + título + corpo) e,
// quando o passo tem `minutes`, um cronômetro regressivo (client).
export default function GuiaPassos({ guide, locale = 'pt' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {guide.steps.map((passo, i) => (
        <div key={i} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: 'var(--cor-primaria)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{passo.title}</div>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.5 }}>
            <Markdown text={passo.body || ''} />
          </div>
          {passo.minutes && <Cronometro minutos={passo.minutes} locale={locale} />}
        </div>
      ))}
    </div>
  );
}
