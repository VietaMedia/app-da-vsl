import { test, expect } from 'vitest';
import { escurecer, misturar } from '@/lib/identidade/cores';
import { CLIMAS } from '@/lib/identidade/climas';
import { SIMBOLOS } from '@/lib/identidade/simbolos';
import { tokensCSS, fontsHref } from '@/lib/identidade/tokens';
import { MOODS, SYMBOLS } from '@/lib/schemas';
import exemplo from '../app.config.exemplo.json';

test('escurecer reduz cada canal', () => {
  expect(escurecer('#2F6B3A', 30)).toBe('#214b29');
});
test('misturar 0 devolve a primeira cor', () => {
  expect(misturar('#FBF7F0', '#000000', 0).toLowerCase()).toBe('#fbf7f0');
});
test('todo clima e todo símbolo têm preset', () => {
  for (const m of MOODS) expect(CLIMAS[m]).toBeDefined();
  for (const s of SYMBOLS) expect(SIMBOLOS[s].paths).toMatch(/<path|<circle|<rect/);
});
test('tokens derivam cores ausentes e incluem fontes', () => {
  const css = tokensCSS(exemplo);
  expect(css).toContain('--cor-primaria-escura:');
  expect(css).toContain("--fonte-display:'Cormorant Garamond'");
});
test('tokens incluem o texto suave e sombras derivadas (sem depender de color-mix)', () => {
  const css = tokensCSS(exemplo);
  expect(css).toContain('--cor-texto-suave:');
  expect(css).toContain('--sombra-primaria:');
  expect(css).toContain('--sombra-destaque:');
  expect(css).toContain('--sombra-primaria-escura:');
  expect(css).not.toContain('color-mix');
});
test('fontsHref codifica espaços', () => {
  expect(fontsHref(exemplo)).toContain('Cormorant+Garamond');
});

test('tokens incluem as trincas rgb da primária e do destaque', () => {
  const css = tokensCSS(exemplo);
  expect(css).toMatch(/--cor-primaria-rgb:\d+,\d+,\d+;/);
  expect(css).toMatch(/--cor-destaque-rgb:\d+,\d+,\d+;/);
});
