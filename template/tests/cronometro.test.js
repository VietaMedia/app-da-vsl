import { test, expect } from 'vitest';
import { restanteMs, formatarMMSS } from '@/lib/cronometro-puro';

test('restanteMs calcula a diferença entre o fim e agora', () => {
  expect(restanteMs(1000, 400)).toBe(600);
});

test('restanteMs nunca fica negativo (já passou do fim)', () => {
  expect(restanteMs(1000, 1500)).toBe(0);
});

test('restanteMs no exato instante do fim é 0', () => {
  expect(restanteMs(1000, 1000)).toBe(0);
});

test('formatarMMSS formata 90000ms como 01:30', () => {
  expect(formatarMMSS(90_000)).toBe('01:30');
});

test('formatarMMSS formata 5000ms como 00:05', () => {
  expect(formatarMMSS(5_000)).toBe('00:05');
});

test('formatarMMSS arredonda pra cima frações de segundo', () => {
  expect(formatarMMSS(500)).toBe('00:01');
});

test('formatarMMSS de valor negativo é 00:00', () => {
  expect(formatarMMSS(-500)).toBe('00:00');
});

test('formatarMMSS de 0 é 00:00', () => {
  expect(formatarMMSS(0)).toBe('00:00');
});
