import { test, expect, beforeAll } from 'vitest';
import { decodeJwt } from 'jose';
beforeAll(() => { process.env.SESSION_SECRET = 'x'.repeat(32); });
test('normalizarEmail: minúsculas e sem espaços nas pontas', async () => {
  const { normalizarEmail } = await import('@/lib/auth');
  expect(normalizarEmail(' A@B.co ')).toBe('a@b.co');
});
test('token: assina e verifica; token adulterado falha', async () => {
  const { signToken, verifyToken } = await import('@/lib/auth');
  const t = await signToken({ id: 1, email: 'a@b.c', role: 'user' });
  expect((await verifyToken(t)).id).toBe(1);
  expect(await verifyToken(t + 'x')).toBeNull();
});

test('token: expira em 90 dias', async () => {
  const { signToken } = await import('@/lib/auth');
  const t = await signToken({ id: 1, email: 'a@b.c', role: 'user' });
  const { exp, iat } = decodeJwt(t);
  const noventaDias = 90 * 24 * 60 * 60;
  expect(exp - iat).toBeGreaterThanOrEqual(noventaDias - 60);
  expect(exp - iat).toBeLessThanOrEqual(noventaDias + 60);
});
