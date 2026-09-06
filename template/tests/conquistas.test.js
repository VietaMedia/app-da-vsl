import { test, expect } from 'vitest';
import { conquistas } from '@/lib/conquistas';

function porKey(lista) {
  return Object.fromEntries(lista.map(c => [c.key, c.alcancada]));
}

test('marcos iniciais: primeiro dia e fim da fase 1, mas não semana cheia', () => {
  const lista = conquistas({ diasFeitos: 9, streak: 3, totalDias: 90, aulasFeitas: 2, totalAulas: 12, fimFase1: 9 });
  const status = porKey(lista);
  expect(status['primeiro-dia']).toBe(true);
  expect(status['fase-1']).toBe(true);
  expect(status['semana-cheia']).toBe(false);
});

test('todas as chaves esperadas estão presentes', () => {
  const lista = conquistas({ diasFeitos: 0, streak: 0, totalDias: 90, aulasFeitas: 0, totalAulas: 12, fimFase1: 9 });
  const chaves = lista.map(c => c.key);
  expect(chaves).toEqual([
    'primeiro-dia', 'fase-1', 'semana-cheia', 'um-mes', 'metade', 'dedicacao-total', 'dia-final',
  ]);
});

test('protocolo concluído inteiro alcança tudo, menos dedicação total (aulas incompletas)', () => {
  const lista = conquistas({ diasFeitos: 90, streak: 90, totalDias: 90, aulasFeitas: 2, totalAulas: 12, fimFase1: 9 });
  for (const c of lista) {
    if (c.key === 'dedicacao-total') expect(c.alcancada).toBe(false);
    else expect(c.alcancada).toBe(true);
  }
});

test('dedicação total só quando todas as aulas foram feitas', () => {
  const lista = conquistas({ diasFeitos: 90, streak: 90, totalDias: 90, aulasFeitas: 12, totalAulas: 12, fimFase1: 9 });
  const status = porKey(lista);
  expect(status['dedicacao-total']).toBe(true);
});

test('sem nenhum dia feito, nada é alcançado', () => {
  const lista = conquistas({ diasFeitos: 0, streak: 0, totalDias: 21, aulasFeitas: 0, totalAulas: 0, fimFase1: 9 });
  expect(lista.every(c => c.alcancada === false)).toBe(true);
});

test('locale traduz título e descrição das conquistas', () => {
  const lista = conquistas({ diasFeitos: 1, streak: 0, totalDias: 90, aulasFeitas: 0, totalAulas: 12, fimFase1: 9 }, 'en');
  const primeiro = lista.find(c => c.key === 'primeiro-dia');
  expect(primeiro.titulo).toBe('First day');
  expect(primeiro.descricao).toBe('You got started.');
});

test('descrição do marco final usa o total de dias no locale certo', () => {
  const lista = conquistas({ diasFeitos: 90, streak: 90, totalDias: 90, aulasFeitas: 12, totalAulas: 12, fimFase1: 9 }, 'es');
  const final = lista.find(c => c.key === 'dia-final');
  expect(final.descricao).toBe('Terminaste los 90 días.');
});
