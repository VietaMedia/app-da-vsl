import { test, expect } from 'vitest';
import { validarNota } from '@/lib/diario-puro';

test('aceita texto válido e devolve o texto sem espaços nas pontas', () => {
  const r = validarNota('  ótimo dia  ');
  expect(r.ok).toBe(true);
  expect(r.texto).toBe('ótimo dia');
});

test('rejeita texto vazio', () => {
  expect(validarNota('').ok).toBe(false);
  expect(validarNota('   ').ok).toBe(false);
});

test('rejeita texto maior que 280 caracteres', () => {
  expect(validarNota('a'.repeat(281)).ok).toBe(false);
  expect(validarNota('a'.repeat(280)).ok).toBe(true);
});

test('rejeita valores que não são string', () => {
  expect(validarNota(null).ok).toBe(false);
  expect(validarNota(undefined).ok).toBe(false);
  expect(validarNota(42).ok).toBe(false);
});
