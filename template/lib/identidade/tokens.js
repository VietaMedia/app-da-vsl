import { escurecer, misturar, paraRgba, paraTripla } from './cores';
import { CLIMAS } from './climas';

function derivar(config) {
  const { theme, identity } = config;
  const primaryDark = theme.primaryDark || escurecer(theme.primary, 30);
  const surface = theme.surface || misturar(theme.background, theme.primary, 0.06);
  const line = theme.line || misturar(theme.background, theme.text, 0.12);
  const suave = misturar(theme.background, theme.accent, 0.10);
  const textoSuave = misturar(theme.text, theme.background, 0.45);
  const clima = CLIMAS[identity.mood];
  return {
    primary: theme.primary,
    primaryRgb: paraTripla(theme.primary),
    primaryDark,
    accent: theme.accent,
    accentRgb: paraTripla(theme.accent),
    background: theme.background,
    surface,
    text: theme.text,
    textoSuave,
    line,
    suave,
    radius: clima.radius,
    radiusLg: clima.radiusLg,
    shadow: clima.shadow,
    sombraPrimaria: `0 14px 28px -14px ${paraRgba(theme.primary, 0.7)}`,
    sombraDestaque: `0 14px 28px -14px ${paraRgba(theme.accent, 0.7)}`,
    sombraPrimariaEscura: `0 10px 24px -10px ${paraRgba(primaryDark, 0.55)}`,
    fontDisplay: identity.fonts.display,
    fontBody: identity.fonts.body,
  };
}

export function tokensObjeto(config) {
  const t = derivar(config);
  return {
    '--cor-primaria': t.primary,
    '--cor-primaria-rgb': t.primaryRgb,
    '--cor-primaria-escura': t.primaryDark,
    '--cor-destaque': t.accent,
    '--cor-destaque-rgb': t.accentRgb,
    '--cor-fundo': t.background,
    '--cor-superficie': t.surface,
    '--cor-texto': t.text,
    '--cor-texto-suave': t.textoSuave,
    '--cor-linha': t.line,
    '--cor-suave': t.suave,
    '--raio': t.radius,
    '--raio-g': t.radiusLg,
    '--sombra': t.shadow,
    '--sombra-primaria': t.sombraPrimaria,
    '--sombra-destaque': t.sombraDestaque,
    '--sombra-primaria-escura': t.sombraPrimariaEscura,
    '--fonte-display': `'${t.fontDisplay}', serif`,
    '--fonte-corpo': `'${t.fontBody}', sans-serif`,
  };
}

export function tokensCSS(config) {
  const vars = tokensObjeto(config);
  return Object.entries(vars).map(([k, v]) => `${k}:${v};`).join('');
}

export function fontsHref(config) {
  const { display, body } = config.identity.fonts;
  const enc = s => s.trim().replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${enc(display)}:wght@600;700&family=${enc(body)}:wght@400;600;700;800&display=swap`;
}
