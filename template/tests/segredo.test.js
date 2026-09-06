import { test, expect, afterEach } from 'vitest';

const ORIG_SECRET = process.env.SESSION_SECRET;
const ORIG_ENV = process.env.NODE_ENV;

afterEach(() => {
  if (ORIG_SECRET === undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET = ORIG_SECRET;
  process.env.NODE_ENV = ORIG_ENV;
});

test('segredo curto em produção lança erro', async () => {
  process.env.NODE_ENV = 'production';
  process.env.SESSION_SECRET = 'curto';
  const { segredoSessao } = await import('@/lib/segredo?t=' + Math.random());
  expect(() => segredoSessao()).toThrow(/SESSION_SECRET/);
});

test('segredo válido (32+ chars) é retornado', async () => {
  process.env.NODE_ENV = 'production';
  process.env.SESSION_SECRET = 'a'.repeat(32);
  const { segredoSessao } = await import('@/lib/segredo?t=' + Math.random());
  expect(segredoSessao()).toBe('a'.repeat(32));
});

test('segredo ausente fora de produção retorna fallback', async () => {
  process.env.NODE_ENV = 'development';
  delete process.env.SESSION_SECRET;
  const { segredoSessao } = await import('@/lib/segredo?t=' + Math.random());
  expect(segredoSessao()).toBe('dev-secret-troque-em-producao-32chars');
});
