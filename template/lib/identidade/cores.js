const toRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

export const escurecer = (hex, pct) => toHex(toRgb(hex).map(v => v * (1 - pct / 100)));
export const clarear = (hex, pct) => toHex(toRgb(hex).map(v => v + (255 - v) * (pct / 100)));
export const misturar = (a, b, t) => { const A = toRgb(a), B = toRgb(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
export const paraRgba = (hex, alpha) => { const [r, g, b] = toRgb(hex); return `rgba(${r},${g},${b},${alpha})`; };
// "r,g,b" pra virar --cor-*-rgb — usada em rgba(var(--cor-*-rgb), alpha) no CSS.
export const paraTripla = hex => toRgb(hex).join(',');
