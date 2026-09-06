import { test, expect } from 'vitest';
import { paths, NOMES } from '@/components/ui/icones-paths';

test('NOMES lista os ícones esperados pelo contrato da barra e do cabeçalho', () => {
  const esperados = [
    'home', 'list', 'play', 'basket', 'user', 'leaf', 'check', 'drop', 'scale', 'spark',
    'chev', 'back', 'bell', 'fire', 'lock', 'mail', 'bowl', 'clock', 'cart',
    'share', 'edit', 'calendar', 'trophy', 'note', 'plus', 'minus', 'logout', 'refresh',
  ];
  for (const nome of esperados) expect(NOMES).toContain(nome);
});

test('todo NOME tem um path SVG não vazio', () => {
  expect(NOMES.length).toBeGreaterThan(0);
  for (const nome of NOMES) {
    expect(paths[nome]).toBeTruthy();
    expect(paths[nome]).toMatch(/<path|<circle|<rect/);
  }
});
