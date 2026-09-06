import { test, expect } from 'vitest';
import { configSchema } from '@/lib/schemas';
import { parseConfigText } from '@/lib/config';
import exemplo from '../app.config.exemplo.json';

test('exemplo completo é válido', () => {
  expect(() => configSchema.parse(exemplo)).not.toThrow();
});
test('rejeita módulo com key duplicada', () => {
  const c = structuredClone(exemplo);
  c.modules.push({ ...c.modules[0] });
  expect(() => configSchema.parse(c)).toThrow(/key/);
});
test('rejeita conteúdo de protocolo sem dias', () => {
  const c = structuredClone(exemplo);
  const p = c.modules.find(m => m.type === 'protocolo');
  p.content.days = [];
  expect(() => configSchema.parse(c)).toThrow();
});
test('rejeita videoUrl com esquema javascript: na trilha', () => {
  const c = structuredClone(exemplo);
  const t = c.modules.find(m => m.type === 'trilha');
  t.content.sections[0].steps[0].videoUrl = 'javascript:alert(1)';
  expect(() => configSchema.parse(c)).toThrow();
});
test('rejeita url com esquema data: na biblioteca', () => {
  const c = structuredClone(exemplo);
  c.modules.push({
    key: 'materiais', type: 'biblioteca', title: 'Materiais', subtitle: '',
    content: { items: [{ title: 'Guia', type: 'pdf', url: 'data:text/html,<script>alert(1)</script>', description: '' }] },
  });
  expect(() => configSchema.parse(c)).toThrow();
});
test('parseConfigText com JSON inválido dá mensagem amigável', () => {
  expect(() => parseConfigText('{')).toThrow(/JSON inválido/);
});
test('parseConfigText com objeto que falha no zod dá mensagem amigável', () => {
  expect(() => parseConfigText(JSON.stringify({}))).toThrow(/app.config.json:/);
});
test('parseConfigText com exemplo válido funciona', () => {
  expect(() => parseConfigText(JSON.stringify(exemplo))).not.toThrow();
});
