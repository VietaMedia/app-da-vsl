import { test, expect } from 'vitest';
import { totalItens, indicesPorSecao, resumoLista, estimativaTexto } from '@/lib/modulos/guias';

const lista = {
  kind: 'lista',
  key: 'lista-1',
  title: 'Lista',
  estimate: '15 min',
  sections: [
    { title: 'Seção A', items: [{ name: 'a1', qty: '1' }, { name: 'a2', qty: '1' }, { name: 'a3', qty: '1' }] },
    { title: 'Seção B', items: [{ name: 'b1', qty: '1' }, { name: 'b2', qty: '1' }] },
  ],
};

const receita = {
  kind: 'receita',
  key: 'receita-1',
  title: 'Receita',
  ingredients: ['ing1', 'ing2', 'ing3'],
  steps: ['passo1', 'passo2'],
};

const passos = {
  kind: 'passos',
  key: 'passos-1',
  title: 'Passos',
  steps: [{ title: 'p1', body: 'b1' }, { title: 'p2', body: 'b2' }],
};

const texto = {
  kind: 'texto',
  key: 'texto-1',
  title: 'Texto',
  blocks: [{ heading: 'A', body: 'corpo a', copiavel: true }, { body: 'corpo b', copiavel: false }],
};

const audio = {
  kind: 'audio',
  key: 'audio-1',
  title: 'Áudio',
  tracks: [{ title: 'Faixa 1', url: 'https://x.com/1.mp3' }, { title: 'Faixa 2', url: 'https://x.com/2.mp3' }],
};

const pagina = {
  kind: 'pagina',
  key: 'pagina-1',
  title: 'Página',
  sections: [
    { title: 'Seção A', body: 'corpo a', checklist: ['a1', 'a2'] },
    { title: 'Seção B', body: 'corpo b', checklist: ['b1'] },
    { title: 'Seção C', body: 'corpo c', checklist: [] },
  ],
};

test('totalItens de uma lista com 2 seções (3+2) = 5', () => {
  expect(totalItens(lista)).toBe(5);
});

test('totalItens de uma receita conta os ingredientes', () => {
  expect(totalItens(receita)).toBe(3);
});

test('totalItens de um passo a passo é 0 (sem itens marcáveis)', () => {
  expect(totalItens(passos)).toBe(0);
});

test('indicesPorSecao de uma lista agrupa o índice global sequencial por seção', () => {
  expect(indicesPorSecao(lista)).toEqual([[0, 1, 2], [3, 4]]);
});

test('indicesPorSecao de uma receita retorna os índices dos ingredientes', () => {
  expect(indicesPorSecao(receita)).toEqual([]);
});

test('indicesPorSecao de um passo a passo é []', () => {
  expect(indicesPorSecao(passos)).toEqual([]);
});

test('resumoLista com marcados [0,3] retorna total 5, marcados 2 e porSecao [1,1]', () => {
  expect(resumoLista(lista, [0, 3])).toEqual({ total: 5, marcados: 2, porSecao: [1, 1] });
});

test('resumoLista sem marcados retorna porSecao zerado', () => {
  expect(resumoLista(lista, [])).toEqual({ total: 5, marcados: 0, porSecao: [0, 0] });
});

test('estimativaTexto retorna guide.estimate quando existe', () => {
  expect(estimativaTexto(lista)).toBe('15 min');
});

test('estimativaTexto retorna string vazia quando não existe', () => {
  expect(estimativaTexto(receita)).toBe('');
});

test('totalItens de um guia texto é 0 (blocos não são marcáveis)', () => {
  expect(totalItens(texto)).toBe(0);
});

test('totalItens de um guia audio é 0', () => {
  expect(totalItens(audio)).toBe(0);
});

test('totalItens de uma pagina soma os itens de checklist de todas as seções', () => {
  expect(totalItens(pagina)).toBe(3);
});

test('indicesPorSecao de um guia texto é []', () => {
  expect(indicesPorSecao(texto)).toEqual([]);
});

test('indicesPorSecao de um guia audio é []', () => {
  expect(indicesPorSecao(audio)).toEqual([]);
});

test('indicesPorSecao de uma pagina agrupa o índice global sequencial por seção (pulando seções sem checklist)', () => {
  expect(indicesPorSecao(pagina)).toEqual([[0, 1], [2], []]);
});
