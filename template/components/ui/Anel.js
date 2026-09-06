'use client';
import { motion, useReducedMotion } from 'motion/react';
import NumeroAnimado from './NumeroAnimado';

export default function Anel({ valor, total, tamanho = 84, rotulo, claro = false, duracao = 0.8 }) {
  const reduzida = useReducedMotion();
  const raio = 36;
  const circ = 2 * Math.PI * raio;
  const progresso = total > 0 ? Math.min(1, Math.max(0, valor / total)) : 0;
  const offsetAlvo = circ * (1 - progresso);
  const trilha = claro ? 'rgba(255,255,255,.18)' : 'var(--cor-linha)';
  const corTexto = claro ? '#fff' : 'var(--cor-texto)';

  return (
    <div style={{ position: 'relative', width: tamanho, height: tamanho, flexShrink: 0 }}>
      <svg width={tamanho} height={tamanho} viewBox="0 0 84 84" style={{ display: 'block' }}>
        <circle cx="42" cy="42" r={raio} fill="none" stroke={trilha} strokeWidth="8" />
        <motion.circle
          cx="42"
          cy="42"
          r={raio}
          fill="none"
          stroke="var(--cor-destaque)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          transform="rotate(-90 42 42)"
          initial={{ strokeDashoffset: reduzida ? offsetAlvo : circ }}
          animate={{ strokeDashoffset: offsetAlvo }}
          transition={{ duration: reduzida ? 0 : duracao, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="display" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: corTexto }}><NumeroAnimado valor={valor} duracao={duracao} /></div>
        {rotulo && (
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, letterSpacing: '.5px', textTransform: 'uppercase', color: corTexto }}>
            {rotulo}
          </div>
        )}
      </div>
    </div>
  );
}
