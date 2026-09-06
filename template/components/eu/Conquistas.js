import Icone from '@/components/ui/Icone';
import { t } from '@/lib/i18n';

// Grade 3 colunas dos marcos do protocolo. Alcançados ganham quadrado
// tingido na primária; futuros ficam em cinza com cadeado. Server-safe.
export default function Conquistas({ lista, locale = 'pt' }) {
  return (
    <div className="card">
      <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{t(locale, 'eu.suasConquistas')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {lista.map(c => (
          <div
            key={c.key}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 8px', borderRadius: 16, textAlign: 'center',
              background: c.alcancada ? 'rgba(var(--cor-primaria-rgb), .1)' : 'var(--cor-superficie)',
              opacity: c.alcancada ? 1 : 0.6,
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: c.alcancada ? 'var(--cor-primaria)' : 'var(--cor-linha)',
              }}
            >
              <Icone nome={c.alcancada ? c.icone : 'lock'} tamanho={20} cor={c.alcancada ? '#fff' : 'var(--cor-texto-suave)'} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2, color: c.alcancada ? 'var(--cor-texto)' : 'var(--cor-texto-suave)' }}>
              {c.titulo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
