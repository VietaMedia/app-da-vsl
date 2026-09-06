import { test, expect } from 'vitest';
import { saudacaoPara, temaDaSemana } from '@/lib/dados/hoje';
import { aplicarDelta } from '@/lib/hoje-puro';

test('saudacaoPara escolhe o tom de manhã', () => {
  expect(saudacaoPara(8, 'caloroso')).toBe('Boa manhã');
});

test('saudacaoPara escolhe o tom de noite (energico)', () => {
  expect(saudacaoPara(19, 'energico')).toBe('Última do dia');
});

test('saudacaoPara traduz pro locale pedido (es/en)', () => {
  expect(saudacaoPara(8, 'caloroso', 'es')).toBe('Buenos días');
  expect(saudacaoPara(19, 'energico', 'en')).toBe('Last one today');
});

test('saudacaoPara cai pro pt quando o locale é desconhecido', () => {
  expect(saudacaoPara(8, 'caloroso', 'fr')).toBe(saudacaoPara(8, 'caloroso', 'pt'));
});

test('temaDaSemana remove o prefixo da fase e o sufixo (n/7)', () => {
  expect(temaDaSemana('Fase 2 · A rotina do iogurte (3/7)')).toBe('A rotina do iogurte');
});

test('temaDaSemana sem sufixo retorna o título depois do prefixo', () => {
  expect(temaDaSemana('Fase 1 · Horário fixo')).toBe('Horário fixo');
});

test('temaDaSemana sem prefixo retorna o título inteiro', () => {
  expect(temaDaSemana('Dia 1')).toBe('Dia 1');
});

test('aplicarDelta trava em 0 e não deixa negativo', () => {
  expect(aplicarDelta(0, -1, 16)).toBe(0);
});

test('aplicarDelta soma normalmente dentro do teto', () => {
  expect(aplicarDelta(15, 1, 16)).toBe(16);
});

test('aplicarDelta trava no teto (max)', () => {
  expect(aplicarDelta(16, 1, 16)).toBe(16);
});
