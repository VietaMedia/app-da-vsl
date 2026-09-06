'use client';
import { useState } from 'react';
import Botao from '@/components/ui/Botao';
import { TEXTOS, t } from '@/lib/i18n';

// Lista de lembretes na tela Eu: chip de horário, dias da semana marcados e
// "Feito hoje"/"Desfazer" (reusa a rota lembretes/feito). Otimista, com
// reversão se a chamada falhar.
export default function ListaLembretes({ moduleKey, itens, feitosIniciais, locale = 'pt' }) {
  const textos = TEXTOS[locale] || TEXTOS.pt;
  const NOMES_DIAS = textos.diasSemanaNomes;
  const DIAS = textos.diasSemanaIniciais.map(d => d.slice(0, 1));
  const [feitosHoje, setFeitosHoje] = useState(new Set(feitosIniciais));
  const [erro, setErro] = useState(null);

  async function alternar(itemKey) {
    const anterior = new Set(feitosHoje);
    const feito = feitosHoje.has(itemKey);
    const proximo = new Set(feitosHoje);
    if (feito) proximo.delete(itemKey); else proximo.add(itemKey);
    setFeitosHoje(proximo);
    try {
      const res = await fetch('/api/modulos/lembretes/feito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey, itemKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(locale, 'erro.falhaRegistrar'));
      setFeitosHoje(new Set(data.feitosHoje));
      setErro(null);
    } catch (e) {
      setFeitosHoje(anterior);
      setErro(e.message);
    }
  }

  return (
    <div className="card" id="lembretes">
      <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{t(locale, 'eu.lembretes')}</div>
      {erro && <p style={{ color: '#B3261E', fontSize: 13 }}>{erro}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {itens.map(item => {
          const feito = feitosHoje.has(item.key);
          return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
              <div
                style={{
                  flexShrink: 0, padding: '6px 10px', borderRadius: 10, fontSize: 12, fontWeight: 800,
                  background: 'var(--cor-suave)', color: 'var(--cor-primaria-escura)',
                }}
              >
                {item.time}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</div>
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {DIAS.map((d, i) => (
                    <span
                      key={i}
                      data-rotulo="dia-da-semana"
                      aria-label={NOMES_DIAS ? NOMES_DIAS[i] : d}
                      style={{
                        width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: item.days.includes(i) ? 'var(--cor-primaria)' : 'var(--cor-linha)',
                        color: item.days.includes(i) ? '#fff' : 'var(--cor-texto-suave)',
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ width: 120, flexShrink: 0 }}>
                <Botao variante={feito ? 'secundario' : 'primario'} pequeno onClick={() => alternar(item.key)}>
                  {feito ? t(locale, 'eu.desfazer') : t(locale, 'eu.feitoHoje')}
                </Botao>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
