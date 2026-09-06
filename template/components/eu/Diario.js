'use client';
import { useState } from 'react';
import Botao from '@/components/ui/Botao';
import { TEXTOS, t } from '@/lib/i18n';

function dataCurta(iso, locale = 'pt') {
  const d = new Date(iso + 'T00:00:00');
  const diasSemana = (TEXTOS[locale] || TEXTOS.pt).diasSemanaIniciais;
  return `${diasSemana[d.getDay()]} ${d.getDate()}`;
}

// Diário de uma linha: input com contador (máx. 280), "Guardar" e a lista das
// últimas notas. Uma nota por dia — guardar de novo no mesmo dia substitui.
export default function Diario({ notasIniciais, locale = 'pt' }) {
  const [notas, setNotas] = useState(notasIniciais);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function guardar() {
    if (texto.trim() === '') { setErro(t(locale, 'eu.erroEscrevaAlgo')); return; }
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch('/api/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(locale, 'erro.falhaGuardar'));
      setNotas(data.notas);
      setTexto('');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{t(locale, 'eu.comoFoiHoje')}</div>
      <div style={{ position: 'relative' }}>
        <textarea
          value={texto}
          maxLength={280}
          onChange={e => setTexto(e.target.value)}
          placeholder={t(locale, 'eu.escrevaAqui')}
          rows={2}
          style={{
            width: '100%', minHeight: 56, borderRadius: 'var(--raio)', border: '1.5px solid var(--cor-linha)',
            padding: '14px 16px', fontSize: 15, fontWeight: 600, color: 'var(--cor-texto)', resize: 'none', fontFamily: 'inherit',
          }}
        />
        <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--cor-texto-suave)', marginTop: 4 }}>
          {texto.length}/280
        </div>
      </div>
      {erro && <p style={{ color: '#B3261E', fontSize: 13, marginBottom: 8 }}>{erro}</p>}
      <div style={{ marginBottom: 14 }}>
        <Botao pequeno onClick={guardar} carregando={enviando}>{t(locale, 'eu.guardar')}</Botao>
      </div>
      {notas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--cor-linha)', paddingTop: 12 }}>
          {notas.map(n => (
            <div key={n.date} style={{ fontSize: 15, color: 'var(--cor-texto)' }}>
              <span style={{ fontWeight: 800, color: 'var(--cor-texto-suave)' }}>{dataCurta(n.date, locale)}</span>
              {' · '}{n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
