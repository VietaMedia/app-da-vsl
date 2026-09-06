'use client';
import { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Icone from '@/components/ui/Icone';
import { aplicarDelta } from '@/lib/hoje-puro';
import { t } from '@/lib/i18n';

const MAX_BARRAS = 12;

// Cartão do contador (ex.: água) na tela Hoje: o botão maior soma um passo, o
// botão "−" 44px diminui — dois botões irmãos, sem um elemento interativo
// dentro do outro. Atualização otimista com reversão se a chamada falhar.
export default function CartaoContador({ contador, locale = 'pt' }) {
  const [estado, setEstado] = useState(contador);
  const reduzida = useReducedMotion();
  const enviando = useRef(false);

  async function ajustar(delta) {
    if (enviando.current) return;
    enviando.current = true;
    const anterior = estado;
    const max = estado.goal * 2;
    setEstado(e => ({ ...e, valor: aplicarDelta(e.valor, delta, max) }));
    try {
      const res = await fetch('/api/modulos/contador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey: contador.moduleKey, delta }),
      });
      if (!res.ok) throw new Error(t(locale, 'erro.falhaRegistrar'));
      const data = await res.json();
      setEstado(e => ({ ...e, ...data }));
    } catch {
      setEstado(anterior);
    } finally {
      enviando.current = false;
    }
  }

  const barrasTotal = Math.max(1, Math.min(MAX_BARRAS, estado.goal));
  const escala = estado.goal / barrasTotal;
  const preenchidas = Math.round(estado.valor / escala);

  return (
    <div className="card" style={{ padding: 14, paddingRight: 60, position: 'relative' }}>
      <button
        type="button"
        onClick={() => ajustar(-estado.step)}
        aria-label={t(locale, 'hoje.diminuirAria', { label: contador.label })}
        style={{
          position: 'absolute', right: 8, top: 8, width: 44, height: 44, borderRadius: 12,
          border: '1px solid var(--cor-linha)', background: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, zIndex: 1,
        }}
      >
        <Icone nome="minus" tamanho={18} cor="var(--cor-texto)" />
      </button>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
        <motion.button
          type="button"
          whileTap={reduzida ? undefined : { scale: 0.97 }}
          onClick={() => ajustar(estado.step)}
          aria-label={t(locale, 'hoje.somarAria', { label: contador.label })}
          style={{
            flex: 1, minWidth: 0, minHeight: 44, display: 'flex', alignItems: 'center', gap: 10,
            border: 'none', background: 'transparent', padding: 0, margin: 0, paddingRight: 52,
            cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(var(--cor-destaque-rgb), .12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icone nome="drop" tamanho={20} cor="var(--cor-destaque)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cor-texto-suave)' }}>{contador.label.toUpperCase()}</div>
            <div className="display" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span>{estado.valor}</span><span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cor-texto-suave)' }}>{t(locale, 'hoje.de')} {estado.goal}</span>
            </div>
          </div>
        </motion.button>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
        {Array.from({ length: barrasTotal }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < preenchidas ? 'var(--cor-destaque)' : 'var(--cor-suave)' }} />
        ))}
      </div>
    </div>
  );
}
