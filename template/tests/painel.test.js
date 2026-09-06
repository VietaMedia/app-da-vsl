import { test, expect } from 'vitest';
import { validarOverride } from '@/lib/painel/validar';
import exemplo from '../app.config.exemplo.json';

test('app: parcial válido é aceito', () => {
  const r = validarOverride(exemplo, 'content:app', { slogan: 'Novo slogan' });
  expect(r.ok).toBe(true);
  expect(r.value).toEqual({ slogan: 'Novo slogan' });
});

test('app: campo desconhecido é rejeitado', () => {
  const r = validarOverride(exemplo, 'content:app', { slogan: 'x', foo: 'bar' });
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('módulo: key que não existe no config é rejeitada', () => {
  const r = validarOverride(exemplo, 'content:module:nao-existe', { title: 'x' });
  expect(r.ok).toBe(false);
  expect(r.erro).toMatch(/não encontrado|não existe/i);
});

test('módulo: content inválido para o tipo é rejeitado', () => {
  const r = validarOverride(exemplo, 'content:module:horas-de-sono', { content: { metric: 'quebrado' } });
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('módulo: content válido é aceito', () => {
  const r = validarOverride(exemplo, 'content:module:horas-de-sono', {
    title: 'Sono por noite',
    content: { metric: { label: 'Sono', unit: 'h', min: 0, max: 12, step: 0.5 } },
  });
  expect(r.ok).toBe(true);
  expect(r.value.title).toBe('Sono por noite');
  expect(r.value.content.metric.unit).toBe('h');
});

test('key com formato desconhecido é rejeitada', () => {
  const r = validarOverride(exemplo, 'outra-coisa', { x: 1 });
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('tema: parcial válido é aceito', () => {
  const r = validarOverride(exemplo, 'content:theme', { primary: '#123456' });
  expect(r.ok).toBe(true);
  expect(r.value).toEqual({ primary: '#123456' });
});

test('tema: hex inválido é rejeitado', () => {
  const r = validarOverride(exemplo, 'content:theme', { primary: 'nao-e-hex' });
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('identidade: clima desconhecido é rejeitado', () => {
  const r = validarOverride(exemplo, 'content:identity', { mood: 'gotico' });
  expect(r.ok).toBe(false);
  expect(r.erro).toBeTruthy();
});

test('identidade: parcial válido é aceito', () => {
  const r = validarOverride(exemplo, 'content:identity', { mood: 'clinico' });
  expect(r.ok).toBe(true);
  expect(r.value).toEqual({ mood: 'clinico' });
});
