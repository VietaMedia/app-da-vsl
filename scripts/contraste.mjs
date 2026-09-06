#!/usr/bin/env node
// contraste.mjs — contraste WCAG e ajuste de paleta em OKLCH.
// uso como CLI: node contraste.mjs '<json do theme>'
// uso como módulo: import { ratio, ajustarParaContraste, paletaValida, corrigirPaleta } from './contraste.mjs'

// ---------- conversões de cor ----------

function hexParaRgb(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) throw new Error(`hex inválido: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbParaHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

// sRGB -> linear
function srgbParaLinear(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linearParaSrgb(c) {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return v * 255;
}

// luminância relativa WCAG (0..1)
function luminanciaRelativa(hex) {
  const { r, g, b } = hexParaRgb(hex);
  const R = srgbParaLinear(r), G = srgbParaLinear(g), B = srgbParaLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// WCAG 2.1 contrast ratio entre duas cores hex
export function ratio(hexA, hexB) {
  const l1 = luminanciaRelativa(hexA);
  const l2 = luminanciaRelativa(hexB);
  const [claro, escuro] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (claro + 0.05) / (escuro + 0.05);
}

// ---------- OKLab / OKLCH ----------
// Björn Ottosson, https://bottosson.github.io/posts/oklab/

function linearRgbParaOklab(r, g, b) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

function oklabParaLinearRgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

export function hexParaOklab(hex) {
  const { r, g, b } = hexParaRgb(hex);
  return linearRgbParaOklab(srgbParaLinear(r), srgbParaLinear(g), srgbParaLinear(b));
}

export function oklabParaHex(lab) {
  const { r, g, b } = oklabParaLinearRgb(lab);
  return rgbParaHex({ r: linearParaSrgb(r), g: linearParaSrgb(g), b: linearParaSrgb(b) });
}

export function oklabParaOklch({ L, a, b }) {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

export function oklchParaOklab({ L, C, H }) {
  const rad = (H * Math.PI) / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

export function hexParaOklch(hex) {
  return oklabParaOklch(hexParaOklab(hex));
}

export function oklchParaHex(oklch) {
  return oklabParaHex(oklchParaOklab(oklch));
}

// clampa um oklch pra dentro do gamut sRGB reduzindo o croma até caber
function oklchGamutValido(oklch) {
  let { L, C, H } = oklch;
  L = Math.max(0, Math.min(1, L));
  for (let i = 0; i < 24; i++) {
    const { r, g, b } = oklabParaLinearRgb(oklchParaOklab({ L, C, H }));
    if (r >= -0.001 && r <= 1.001 && g >= -0.001 && g <= 1.001 && b >= -0.001 && b <= 1.001) {
      return { L, C, H };
    }
    C *= 0.92; // reduz croma até caber no gamut
  }
  return { L, C, H };
}

// ---------- ajuste de contraste ----------

/**
 * Move a luminosidade (L) de `cor` em OKLCH, mantendo H e C, até que o
 * contraste WCAG contra `fundo` seja >= `minimo`. Escurece ou clareia,
 * o que for mais curto pro lado oposto do fundo.
 */
export function ajustarParaContraste(cor, fundo, minimo) {
  if (ratio(cor, fundo) >= minimo) return cor;
  const oklch = hexParaOklch(cor);
  const lFundo = hexParaOklch(fundo).L;
  // decide direção: se a cor já é mais escura que o fundo, escurece mais; senão clareia mais.
  const escurecer = oklch.L <= lFundo;
  let melhorHex = cor;
  let melhorRatio = ratio(cor, fundo);
  const passos = 200;
  for (let i = 1; i <= passos; i++) {
    const alvoL = escurecer ? oklch.L * (1 - i / passos) : oklch.L + (1 - oklch.L) * (i / passos);
    const ajustado = oklchGamutValido({ L: alvoL, C: oklch.C, H: oklch.H });
    const hex = oklchParaHex(ajustado);
    const r = ratio(hex, fundo);
    if (r > melhorRatio) { melhorRatio = r; melhorHex = hex; }
    if (r >= minimo) return hex;
  }
  // não conseguiu no sentido natural: tenta o sentido oposto como último recurso
  if (melhorRatio < minimo) {
    for (let i = 1; i <= passos; i++) {
      const alvoL = escurecer ? oklch.L + (1 - oklch.L) * (i / passos) : oklch.L * (1 - i / passos);
      const ajustado = oklchGamutValido({ L: alvoL, C: oklch.C, H: oklch.H });
      const hex = oklchParaHex(ajustado);
      const r = ratio(hex, fundo);
      if (r > melhorRatio) { melhorRatio = r; melhorHex = hex; }
      if (r >= minimo) return hex;
    }
  }
  return melhorHex;
}

// ---------- validação de paleta ----------

/**
 * theme: { primary, primaryDark, accent, background, surface, text, ... } (todos hex)
 * devolve lista de strings descrevendo problemas (vazia = ok).
 */
export function paletaValida(theme) {
  const problemas = [];
  const { primary, primaryDark, accent, background, text, surface } = theme;
  const fundoTexto = surface || background;

  if (text && fundoTexto) {
    const r = ratio(text, fundoTexto);
    if (r < 4.5) problemas.push(`texto sobre fundo: contraste ${r.toFixed(2)}:1, precisa de 4,5:1`);
  }
  if (primary) {
    const r = ratio('#FFFFFF', primary);
    if (r < 3) problemas.push(`branco sobre primária: contraste ${r.toFixed(2)}:1, precisa de 3:1`);
  }
  if (accent) {
    const r = ratio('#FFFFFF', accent);
    if (r < 3) problemas.push(`branco sobre acento: contraste ${r.toFixed(2)}:1, precisa de 3:1`);
  }
  if (primary && primaryDark) {
    const lPrimary = hexParaOklch(primary).L;
    const lDark = hexParaOklch(primaryDark).L;
    if (lDark >= lPrimary) problemas.push(`primária escura (L=${lDark.toFixed(2)}) não é mais escura que a primária (L=${lPrimary.toFixed(2)})`);
  }
  return problemas;
}

/**
 * Aplica ajustarParaContraste onde paletaValida apontar problema. Devolve um
 * novo objeto theme corrigido (não muta o original).
 */
export function corrigirPaleta(theme) {
  const t = { ...theme };
  const fundoTexto = t.surface || t.background;

  if (t.text && fundoTexto && ratio(t.text, fundoTexto) < 4.5) {
    t.text = ajustarParaContraste(t.text, fundoTexto, 4.5);
  }
  if (t.primary && ratio('#FFFFFF', t.primary) < 3) {
    t.primary = ajustarParaContraste(t.primary, '#FFFFFF', 3);
  }
  if (t.accent && ratio('#FFFFFF', t.accent) < 3) {
    t.accent = ajustarParaContraste(t.accent, '#FFFFFF', 3);
  }
  if (t.primary && t.primaryDark) {
    const lPrimary = hexParaOklch(t.primary).L;
    const lDark = hexParaOklch(t.primaryDark).L;
    if (lDark >= lPrimary) {
      const oklch = hexParaOklch(t.primaryDark);
      t.primaryDark = oklchParaHex(oklchGamutValido({ ...oklch, L: Math.max(0, lPrimary - 0.12) }));
    }
  }
  return t;
}

// ---------- CLI ----------

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('uso: node contraste.mjs \'<json do theme>\'');
    console.error('  ex.: node contraste.mjs \'{"primary":"#2F6B3A","primaryDark":"#1F4A28","accent":"#E07A2F","background":"#FBF7F0","surface":"#FFFFFF","text":"#1F2A1F"}\'');
    process.exit(1);
  }
  const theme = JSON.parse(arg);
  const problemas = paletaValida(theme);
  if (problemas.length) {
    console.error('problemas encontrados:');
    for (const p of problemas) console.error(`  - ${p}`);
  } else {
    console.error('paleta já válida.');
  }
  const corrigido = corrigirPaleta(theme);
  console.log(JSON.stringify(corrigido, null, 2));
}
