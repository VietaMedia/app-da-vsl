import { test, expect } from 'vitest';
import { validarPasso, resultadoAvaliacao, paraNumero } from '@/lib/avaliacao';

test('paraNumero aceita vírgula decimal', () => {
  expect(paraNumero('7,5')).toBe(7.5);
});

test('paraNumero string vazia dá NaN', () => {
  expect(paraNumero('')).toBeNaN();
});

test('paraNumero inteiro sem separador', () => {
  expect(paraNumero('8')).toBe(8);
});

test('paraNumero texto não numérico dá NaN', () => {
  expect(paraNumero('abc')).toBeNaN();
});

test('validarPasso aceita número dentro dos limites', () => {
  expect(validarPasso({ key: 'peso', min: 30, max: 250 }, '80')).toEqual({ ok: true, valor: 80 });
});

test('validarPasso rejeita texto não numérico', () => {
  const r = validarPasso({ key: 'peso', min: 30, max: 250 }, 'abc');
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('validarPasso rejeita valor abaixo do mínimo', () => {
  const r = validarPasso({ key: 'peso', min: 30, max: 250 }, '10');
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('validarPasso rejeita valor acima do máximo', () => {
  const r = validarPasso({ key: 'peso', min: 30, max: 250 }, '300');
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('validarPasso aceita min = 0 (não deve tratar como ausente)', () => {
  expect(validarPasso({ key: 'acordar', min: 0, max: 23 }, '0')).toEqual({ ok: true, valor: 0 });
  const r = validarPasso({ key: 'acordar', min: 0, max: 23 }, '-1');
  expect(r.ok).toBe(false);
});

test('validarPasso sem min/max só valida que é número finito', () => {
  expect(validarPasso({ key: 'x' }, '5.5')).toEqual({ ok: true, valor: 5.5 });
  expect(validarPasso({ key: 'x' }, '').ok).toBe(false);
});

const modExemplo = {
  type: 'calculadora',
  content: {
    inputs: [
      { key: 'acordar', label: 'Hora que precisa acordar', unit: 'h', default: 6, min: 0, max: 23 },
      { key: 'meta', label: 'Meta de horas de sono', unit: 'h', default: 7.5, min: 4, max: 12 },
    ],
    formula: '(acordar - meta + 24) % 24',
    resultLabel: 'Vá pra cama às',
    resultUnit: 'h',
    explanation: 'Para dormir {meta}h e acordar às {acordar}h, deite às {result}h.',
    onboarding: true,
    metricKey: 'horas-de-sono',
    goalInput: 'meta',
  },
};

test('resultadoAvaliacao devolve result numérico, texto formatado e goal', () => {
  const r = resultadoAvaliacao(modExemplo, { acordar: 6, meta: 7.5 });
  expect(r.result).toBeCloseTo(22.5);
  expect(r.texto).toBe('Para dormir 7.5h e acordar às 6h, deite às 22,5h.');
  expect(r.goal).toBe(7.5);
});

test('resultadoAvaliacao sem goalInput não define goal', () => {
  const mod = { ...modExemplo, content: { ...modExemplo.content, goalInput: undefined } };
  const r = resultadoAvaliacao(mod, { acordar: 6, meta: 7.5 });
  expect(r.goal).toBeUndefined();
});

test('resultadoAvaliacao lança mensagem em português se a fórmula falhar', () => {
  expect(() => resultadoAvaliacao(modExemplo, { acordar: 6 })).toThrow(/não foi possível calcular/i);
});
