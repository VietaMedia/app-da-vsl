import { t } from '@/lib/i18n';

export function pontosParaPath(regs, { w, h, min, max }) {
  if (!regs.length) return '';
  const n = regs.length, span = Math.max(1e-9, max - min);
  return regs.map((r, i) => {
    const x = n === 1 ? w / 2 : (i / (n - 1)) * w;
    const y = h - ((Math.min(max, Math.max(min, r.value)) - min) / span) * h;
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export default function GraficoLinha({ regs, min, max, goal, locale = 'pt' }) {
  const w = 320, h = 120;
  const d = pontosParaPath(regs, { w, h, min, max });
  const gy = goal != null ? h - ((goal - min) / (max - min)) * h : null;
  const area = d ? `${d} L${w},${h} L0,${h} Z` : '';
  return (<svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={t(locale, 'eu.graficoAria')}>
    <defs>
      <linearGradient id="grafico-linha-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--cor-primaria)" stopOpacity="0.25" />
        <stop offset="100%" stopColor="var(--cor-primaria)" stopOpacity="0" />
      </linearGradient>
    </defs>
    {area && <path d={area} fill="url(#grafico-linha-area)" stroke="none" />}
    {gy != null && <line x1="0" x2={w} y1={gy} y2={gy} stroke="var(--cor-destaque)" strokeDasharray="4 4" />}
    <path d={d} fill="none" stroke="var(--cor-primaria)" strokeWidth="3" strokeLinejoin="round" />
  </svg>);
}
