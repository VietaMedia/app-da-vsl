import { test, expect } from 'vitest';
import { fasesDoProtocolo } from '@/lib/modulos/fases';

const days = [
  { day: 1, title: 'Fase 1 · Horário fixo', tasks: ['a'] },
  { day: 2, title: 'Fase 1 · Sem telas', tasks: ['b'] },
  { day: 3, title: 'Fase 1 · Revisão', tasks: ['c'] },
  { day: 4, title: 'Fase 2 · Exposição à luz', tasks: ['d'] },
  { day: 5, title: 'Fase 2 · Movimento', tasks: ['e'] },
  { day: 6, title: 'Fase 3 · Consolidação', tasks: ['f'] },
];

test('agrupa dias em fases pelo prefixo antes do " · "', () => {
  const fases = fasesDoProtocolo(days);
  expect(fases).toHaveLength(3);
  expect(fases[0]).toMatchObject({ title: 'Fase 1', from: 1, to: 3 });
  expect(fases[1]).toMatchObject({ title: 'Fase 2', from: 4, to: 5 });
  expect(fases[2]).toMatchObject({ title: 'Fase 3', from: 6, to: 6 });
});

test('dias sem prefixo caem numa única fase "Protocolo"', () => {
  const semPrefixo = [
    { day: 1, title: 'Dia 1', tasks: ['a'] },
    { day: 2, title: 'Dia 2', tasks: ['b'] },
  ];
  const fases = fasesDoProtocolo(semPrefixo);
  expect(fases).toHaveLength(1);
  expect(fases[0]).toMatchObject({ title: 'Protocolo', from: 1, to: 2 });
});
