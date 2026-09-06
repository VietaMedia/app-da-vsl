'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Botao from '@/components/ui/Botao';
import { restanteMs, formatarMMSS } from '@/lib/cronometro-puro';
import { t } from '@/lib/i18n';

// Cronômetro regressivo de um passo: anel desenhado com `motion` (progresso =
// tempo restante / total) e mm:ss no centro. Roda só enquanto a página está
// aberta, sem som e sem tocar o document.title.
//
// Baseado em instante-alvo (`fimEm` = Date.now() + restante), não em contador
// decrescente: a cada tick (250ms) recalcula o restante a partir do relógio,
// e recalcula de novo assim que a aba volta a ficar visível — assim não perde
// precisão quando o navegador atrasa/pausa o setInterval em segundo plano.
export default function Cronometro({ minutos, locale = 'pt' }) {
  const total = minutos * 60 * 1000;
  const [restante, setRestante] = useState(total);
  const [rodando, setRodando] = useState(false);
  const fimEmRef = useRef(null);
  const reduzida = useReducedMotion();

  useEffect(() => {
    if (!rodando) return;
    fimEmRef.current = Date.now() + restante;

    function tick() {
      const r = restanteMs(fimEmRef.current, Date.now());
      setRestante(r);
      if (r <= 0) setRodando(false);
    }
    tick();
    const id = setInterval(tick, 250);

    function aoMudarVisibilidade() {
      if (document.visibilityState === 'visible') tick();
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidade);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando]);

  const raio = 36;
  const circ = 2 * Math.PI * raio;
  const progresso = total > 0 ? restante / total : 0;
  const offsetAlvo = circ * (1 - progresso);
  const pronto = restante <= 0;

  function alternar() {
    if (pronto) return;
    setRodando(r => !r);
  }

  function zerar() {
    setRodando(false);
    setRestante(total);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 84, height: 84 }}>
        <svg width={84} height={84} viewBox="0 0 84 84" style={{ display: 'block' }}>
          <circle cx="42" cy="42" r={raio} fill="none" stroke="var(--cor-linha)" strokeWidth="8" />
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
            animate={{ strokeDashoffset: offsetAlvo }}
            transition={{ duration: reduzida ? 0 : (rodando ? 0.25 : 0.3), ease: 'linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="display" style={{ fontSize: pronto ? 15 : 20, fontWeight: 700 }}>
            {pronto ? t(locale, 'kit.pronto') : formatarMMSS(restante)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        {!pronto && (
          <Botao variante="primario" pequeno onClick={alternar}>
            {rodando ? t(locale, 'kit.pausar') : (restante === total ? t(locale, 'kit.iniciar') : t(locale, 'kit.continuar'))}
          </Botao>
        )}
        <Botao variante="secundario" pequeno onClick={zerar}>{t(locale, 'kit.zerar')}</Botao>
      </div>
    </div>
  );
}
