'use client';
import { useEffect, useState } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';

// Conta de 0 até `valor` em 0.8s (easeOut). Sob "reduzir movimento", pula
// direto pro valor final. `formatar` decide como o número (ainda fracionário
// durante a animação) aparece na tela — por padrão arredonda pro inteiro
// mais próximo; passe uma função própria pra manter casas decimais, unidade
// etc.
export default function NumeroAnimado({ valor, duracao = 0.8, formatar = v => Math.round(v) }) {
  const reduzida = useReducedMotion();
  const motionValue = useMotionValue(0);
  // Sempre nasce em 0 (mesmo sob reduzir movimento) pra bater com a marcação
  // do servidor — o efeito abaixo, que só roda no cliente, corrige pro valor
  // final imediatamente quando `reduzida` é true, sem esperar a animação.
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
    if (reduzida) { setExibido(valor); return; }
    const controls = animate(motionValue, valor, {
      duration: duracao,
      ease: 'easeOut',
      onUpdate: v => setExibido(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, reduzida]);

  return <>{formatar(exibido)}</>;
}
