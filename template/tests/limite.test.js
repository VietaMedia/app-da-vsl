import { test, expect } from 'vitest';
import { permitir, chaveDoRequest } from '@/lib/limite';

test('permite até o máximo e bloqueia a próxima', () => {
  const chave = 'teste:' + Math.random();
  for (let i = 0; i < 5; i++) expect(permitir(chave, { max: 5, agora: 1000 })).toBe(true);
  expect(permitir(chave, { max: 5, agora: 1000 })).toBe(false);
});

test('chaves diferentes têm limites independentes', () => {
  const a = 'teste:a:' + Math.random();
  const b = 'teste:b:' + Math.random();
  for (let i = 0; i < 3; i++) expect(permitir(a, { max: 3, agora: 2000 })).toBe(true);
  expect(permitir(a, { max: 3, agora: 2000 })).toBe(false);
  expect(permitir(b, { max: 3, agora: 2000 })).toBe(true);
});

test('janela expira e libera novas tentativas', () => {
  const chave = 'teste:janela:' + Math.random();
  for (let i = 0; i < 3; i++) expect(permitir(chave, { max: 3, janelaMs: 1000, agora: 10000 })).toBe(true);
  expect(permitir(chave, { max: 3, janelaMs: 1000, agora: 10000 })).toBe(false);
  expect(permitir(chave, { max: 3, janelaMs: 1000, agora: 11500 })).toBe(true);
});

test('chaveDoRequest usa o primeiro IP do x-forwarded-for', () => {
  const req = { headers: new Map([['x-forwarded-for', '1.2.3.4, 5.6.7.8']]) };
  req.headers.get = Map.prototype.get.bind(req.headers);
  expect(chaveDoRequest(req, 'login')).toBe('login:1.2.3.4');
});

test('chaveDoRequest usa local sem header', () => {
  const req = { headers: { get: () => null } };
  expect(chaveDoRequest(req, 'login')).toBe('login:local');
});
