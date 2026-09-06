import { test, expect } from 'vitest';
import { mergeOverrides } from '@/lib/content';
import exemplo from '../app.config.exemplo.json';
test('override de app troca só o que veio', () => {
  const r = mergeOverrides(exemplo, { 'content:app': { slogan: 'Novo slogan' } });
  expect(r.app.slogan).toBe('Novo slogan'); expect(r.app.name).toBe(exemplo.app.name);
});
test('override de módulo substitui o content inteiro do módulo', () => {
  const k = 'content:module:horas-de-sono';
  const r = mergeOverrides(exemplo, { [k]: { title: 'Sono por noite', content: { metric: { label: 'Sono', unit: 'h', min: 0, max: 12, step: 0.5 } } } });
  const m = r.modules.find(m => m.key === 'horas-de-sono');
  expect(m.title).toBe('Sono por noite'); expect(m.content.goal).toBeUndefined();
});
test('override inválido é ignorado e o original fica', () => {
  const r = mergeOverrides(exemplo, { 'content:module:horas-de-sono': { content: { metric: 'quebrado' } } });
  expect(r.modules.find(m => m.key === 'horas-de-sono').content.metric.unit).toBe('h');
});
test('override pode limpar (esvaziar) o título e o subtítulo', () => {
  const r = mergeOverrides(exemplo, { 'content:module:horas-de-sono': { title: '', subtitle: '' } });
  const m = r.modules.find(m => m.key === 'horas-de-sono');
  expect(m.title).toBe(''); expect(m.subtitle).toBe('');
});
test('override de tema troca só a cor enviada', () => {
  const r = mergeOverrides(exemplo, { 'content:theme': { primary: '#123456' } });
  expect(r.theme.primary).toBe('#123456');
  expect(r.theme.accent).toBe(exemplo.theme.accent);
});
test('override de identidade troca o clima mas preserva fontes e ícone', () => {
  const r = mergeOverrides(exemplo, { 'content:identity': { mood: 'clinico' } });
  expect(r.identity.mood).toBe('clinico');
  expect(r.identity.fonts).toEqual(exemplo.identity.fonts);
  expect(r.identity.icon).toEqual(exemplo.identity.icon);
});

test('override de primary sem primaryDark apaga o primaryDark antigo (derivar recalcula)', () => {
  const base = { ...exemplo, theme: { ...exemplo.theme, primaryDark: '#000000' } };
  const r = mergeOverrides(base, { 'content:theme': { primary: '#123456' } });
  expect(r.theme.primary).toBe('#123456');
  expect(r.theme.primaryDark).toBeUndefined();
});

test('override de primary que também manda primaryDark preserva o valor enviado', () => {
  const base = { ...exemplo, theme: { ...exemplo.theme, primaryDark: '#000000' } };
  const r = mergeOverrides(base, { 'content:theme': { primary: '#123456', primaryDark: '#abcdef' } });
  expect(r.theme.primaryDark).toBe('#abcdef');
});

test('override de background sem surface/line apaga os antigos (derivar recalcula)', () => {
  const base = { ...exemplo, theme: { ...exemplo.theme, surface: '#eeeeee', line: '#dddddd' } };
  const r = mergeOverrides(base, { 'content:theme': { background: '#fafafa' } });
  expect(r.theme.background).toBe('#fafafa');
  expect(r.theme.surface).toBeUndefined();
  expect(r.theme.line).toBeUndefined();
});
