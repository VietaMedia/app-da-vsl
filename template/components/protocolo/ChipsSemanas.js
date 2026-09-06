'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import Chip from '@/components/ui/Chip';
import { t } from '@/lib/i18n';

// Chips "Semana N" roláveis horizontalmente, a semana visível destacada.
// A chip ativa se centraliza na rolagem (scroll-snap + scrollIntoView) tanto
// no primeiro render quanto a cada troca de semana. Só troca qual semana está
// sendo mostrada — não implica nada sobre o progresso do usuário (dias
// futuros continuam abrindo só pra leitura).
export default function ChipsSemanas({ totalSemanas, semanaAtiva, onSelecionar, locale = 'pt' }) {
  const reduzida = useReducedMotion();
  const refAtiva = useRef(null);

  useEffect(() => {
    refAtiva.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduzida ? 'auto' : 'smooth' });
  }, [semanaAtiva, reduzida]);

  return (
    <div className="chips-semanas" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {Array.from({ length: totalSemanas }, (_, i) => i + 1).map(n => (
        <div key={n} ref={n === semanaAtiva ? refAtiva : undefined}>
          <Chip ativo={n === semanaAtiva} onClick={() => onSelecionar(n)}>{t(locale, 'protocolo.semanaN', { n })}</Chip>
        </div>
      ))}
    </div>
  );
}
