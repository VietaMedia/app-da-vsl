import { test, expect } from 'vitest';
import { evaluateFormula, renderExplanation } from '@/lib/modulos/calculadora';
test('avalia fórmula com variáveis', () => { expect(evaluateFormula('(acordar - ciclos * 1.5 + 24) % 24', { acordar: 6, ciclos: 5 })).toBeCloseTo(22.5); });
test('variável faltando lança erro', () => { expect(() => evaluateFormula('a + b', { a: 1 })).toThrow(); });
test('não executa código arbitrário', () => { expect(() => evaluateFormula('process.exit(1)', {})).toThrow(); });
test('explicação substitui chaves e formata com vírgula', () => {
  expect(renderExplanation('Deite às {result}h para acordar às {acordar}h', { acordar: 6 }, 22.5)).toBe('Deite às 22,5h para acordar às 6h');
});
test('explicação não mostra decimais para resultado inteiro', () => {
  expect(renderExplanation('Faltam {result} semanas', {}, 14)).toBe('Faltam 14 semanas');
});
