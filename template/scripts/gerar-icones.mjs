import sharp from 'sharp';
import fs from 'node:fs';
import { escurecer } from '../lib/identidade/cores.js';
import { SIMBOLOS } from '../lib/identidade/simbolos.js';

const cfg = JSON.parse(fs.readFileSync('app.config.json', 'utf8'));
const primary = cfg.theme.primary;
const primaryDark = cfg.theme.primaryDark || escurecer(primary, 30);
const accent = cfg.theme.accent;
const simbolo = SIMBOLOS[cfg.identity.icon.symbol];

function iconeSVG(size, { maskable = false } = {}) {
  // Ícone "maskable" (icon-512, usado pelo manifesto do PWA) precisa de fundo
  // full-bleed, sem cantos arredondados transparentes — o sistema operacional
  // é quem recorta a forma final (círculo, squircle etc.), e cantos
  // arredondados nossos criariam uma borda dupla/estranha dentro do recorte
  // dele. Os ícones "any" (192 e apple-touch) mantêm o visual arredondado.
  const radius = maskable ? 0 : size * 0.2;
  const symbolSize = size * 0.62;
  const offset = (size - symbolSize) / 2;
  const accentPath = simbolo.accentPath ? `<path d="${simbolo.accentPath}" fill="${accent}" stroke="${accent}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="fundo" x1="0" y1="0" x2="${Math.sin(160 * Math.PI / 180) * size}" y2="${-Math.cos(160 * Math.PI / 180) * size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${primaryDark}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#fundo)"/>
  <g transform="translate(${offset}, ${offset})">
    <svg width="${symbolSize}" height="${symbolSize}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      ${simbolo.paths}
      ${accentPath}
    </svg>
  </g>
</svg>`;
}

function simboloSVG(size = 512) {
  const accentPath = simbolo.accentPath ? `<path d="${simbolo.accentPath}" fill="${accent}" stroke="${accent}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  ${simbolo.paths}
  ${accentPath}
</svg>`;
}

fs.mkdirSync('public/icons', { recursive: true });
for (const [name, s, opts] of [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, {}],
])
  await sharp(Buffer.from(iconeSVG(s, opts))).png().toFile('public/icons/' + name);
fs.writeFileSync('public/icons/simbolo.svg', simboloSVG(512));
console.log('ícones gerados com o símbolo', cfg.identity.icon.symbol);
