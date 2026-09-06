import { test, expect } from 'vitest';
import { pontosParaPath } from '@/components/ui/GraficoLinha';
test('gera path com um M e N-1 L', () => {
  const d = pontosParaPath([{ date: '2026-09-01', value: 5 }, { date: '2026-09-02', value: 7 }, { date: '2026-09-03', value: 6 }], { w: 300, h: 100, min: 0, max: 10 });
  expect(d.startsWith('M')).toBe(true); expect((d.match(/L/g) || []).length).toBe(2);
});
test('lista vazia devolve string vazia', () => { expect(pontosParaPath([], { w: 1, h: 1, min: 0, max: 1 })).toBe(''); });
