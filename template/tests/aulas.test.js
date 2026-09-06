import { test, expect } from 'vitest';
import { minutosDeLeitura, proximaAula } from '@/lib/aulas-puro';

test('minutosDeLeitura arredonda pelo total de palavras (180/min)', () => {
  expect(minutosDeLeitura('palavra '.repeat(360))).toBe(2);
});

test('minutosDeLeitura nunca fica abaixo de 1 min', () => {
  expect(minutosDeLeitura('poucas palavras aqui')).toBe(1);
  expect(minutosDeLeitura('')).toBe(1);
});

const mod = {
  content: {
    sections: [
      { key: 'base', title: 'Base', steps: [
        { key: 'a', title: 'Aula A', body: 'texto' },
        { key: 'b', title: 'Aula B', body: 'texto' },
      ] },
      { key: 'avancado', title: 'Avançado', steps: [
        { key: 'c', title: 'Aula C', body: 'texto' },
      ] },
    ],
  },
};

test('proximaAula pega a primeira aula não concluída, em ordem', () => {
  expect(proximaAula(mod, [])).toEqual({ sectionKey: 'base', stepKey: 'a', title: 'Aula A', minutos: 1 });
});

test('proximaAula pula aulas já concluídas (itemIndex -1) e cruza seções', () => {
  const feitos = [{ stepKey: 'a', itemIndex: -1 }, { stepKey: 'b', itemIndex: -1 }];
  expect(proximaAula(mod, feitos)).toEqual({ sectionKey: 'avancado', stepKey: 'c', title: 'Aula C', minutos: 1 });
});

test('proximaAula ignora marcações de checklist (itemIndex >= 0), só conta o passo inteiro', () => {
  const feitos = [{ stepKey: 'a', itemIndex: 0 }];
  expect(proximaAula(mod, feitos)).toEqual({ sectionKey: 'base', stepKey: 'a', title: 'Aula A', minutos: 1 });
});

test('proximaAula retorna null quando tudo concluído', () => {
  const feitos = [{ stepKey: 'a', itemIndex: -1 }, { stepKey: 'b', itemIndex: -1 }, { stepKey: 'c', itemIndex: -1 }];
  expect(proximaAula(mod, feitos)).toBeNull();
});
