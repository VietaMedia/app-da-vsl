import { test, expect } from 'vitest';
import { computeStreak, diaAtual, validarItem, diaAtualComInicio, semanaDoDia, diaFeito, podeMarcarDia } from '@/lib/modulos/protocolo';
test('sequência conta dias consecutivos até hoje', () => {
  expect(computeStreak(['2026-09-03', '2026-09-04', '2026-09-05'], '2026-09-05')).toBe(3);
});
test('sequência quebra se faltou ontem', () => {
  expect(computeStreak(['2026-09-02', '2026-09-03', '2026-09-05'], '2026-09-05')).toBe(1);
});
test('sem check-in hoje ainda conta a sequência de ontem', () => {
  expect(computeStreak(['2026-09-03', '2026-09-04'], '2026-09-05')).toBe(2);
});
test('dia atual avança com o calendário e trava no último', () => {
  expect(diaAtual('2026-09-01', '2026-09-03', 21)).toBe(3);
  expect(diaAtual('2026-09-01', '2026-12-01', 21)).toBe(21);
  expect(diaAtual(null, '2026-09-05', 21)).toBe(1);
});

const mod = { content: { days: [{ day: 1, tasks: ['a', 'b'] }, { day: 2, tasks: ['c'] }] } };
test('validarItem aceita par válido', () => {
  expect(validarItem(mod, 1, 0)).toEqual({ ok: true });
  expect(validarItem(mod, 1, 1)).toEqual({ ok: true });
});
test('validarItem rejeita dia 0', () => {
  expect(validarItem(mod, 0, 0).ok).toBe(false);
});
test('validarItem rejeita dia além do total', () => {
  expect(validarItem(mod, 3, 0).ok).toBe(false);
});
test('validarItem rejeita taskIndex além das tarefas do dia', () => {
  expect(validarItem(mod, 2, 1).ok).toBe(false);
});
test('validarItem rejeita valores não inteiros', () => {
  expect(validarItem(mod, 1.5, 0).ok).toBe(false);
  expect(validarItem(mod, 1, 0.5).ok).toBe(false);
});

test('diaAtualComInicio usa o startDate do perfil quando presente', () => {
  expect(diaAtualComInicio('2026-09-01', null, '2026-09-05', 21)).toBe(5);
  expect(diaAtualComInicio('2026-09-01', null, '2026-12-01', 21)).toBe(21);
  expect(diaAtualComInicio('2026-09-05', null, '2026-09-05', 21)).toBe(1);
});

test('diaAtualComInicio cai para a regra do primeiro check-in quando não há startDate', () => {
  expect(diaAtualComInicio(null, '2026-09-01', '2026-09-05', 21)).toBe(5);
  expect(diaAtualComInicio(null, null, '2026-09-05', 21)).toBe(1);
});

test('semanaDoDia agrupa em blocos de 7', () => {
  expect(semanaDoDia(1)).toBe(1);
  expect(semanaDoDia(7)).toBe(1);
  expect(semanaDoDia(8)).toBe(2);
  expect(semanaDoDia(21)).toBe(3);
});

test('diaFeito é true quando todas as tarefas do dia têm check-in', () => {
  expect(diaFeito(2, [{ itemKey: 'd2-t0' }, { itemKey: 'd2-t1' }], ['a', 'b'])).toBe(true);
});

test('diaFeito é false quando falta alguma tarefa', () => {
  expect(diaFeito(2, [{ itemKey: 'd2-t0' }], ['a', 'b'])).toBe(false);
});

test('diaFeito ignora check-ins de outros dias', () => {
  expect(diaFeito(2, [{ itemKey: 'd1-t0' }, { itemKey: 'd1-t1' }], ['a', 'b'])).toBe(false);
});

test('podeMarcarDia permite o dia atual e os anteriores, bloqueia o futuro', () => {
  expect(podeMarcarDia(3, 3)).toBe(true);
  expect(podeMarcarDia(1, 3)).toBe(true);
  expect(podeMarcarDia(4, 3)).toBe(false);
});
