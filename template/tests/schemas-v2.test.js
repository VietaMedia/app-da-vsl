import { test, expect } from 'vitest';
import { configSchema, identitySchema, moduleSchemas } from '@/lib/schemas';
import exemplo from '../app.config.exemplo.json';

test('exemplo v2 é válido e tem identidade', () => {
  const c = configSchema.parse(exemplo);
  expect(c.identity.mood).toBeDefined();
  expect(c.identity.icon.symbol).toBeDefined();
  expect(c.modules.some(m => m.type === 'guias')).toBe(true);
  expect(c.modules.some(m => m.type === 'contador')).toBe(true);
  expect(c.modules.find(m => m.type === 'calculadora').content.onboarding).toBe(true);
});

test('identidade rejeita clima desconhecido', () => {
  expect(() => identitySchema.parse({ mood: 'gotico', fonts: { display: 'A', body: 'B' }, icon: { symbol: 'leaf' }, illustration: 'leaf' })).toThrow();
});

test('guia do tipo lista exige seções com itens', () => {
  const c = structuredClone(exemplo);
  const g = c.modules.find(m => m.type === 'guias');
  g.content.guides[0] = { key: 'x', kind: 'lista', title: 'X', intro: '', sections: [] };
  expect(() => configSchema.parse(c)).toThrow();
});

test('contador exige meta positiva', () => {
  const c = structuredClone(exemplo);
  c.modules.find(m => m.type === 'contador').content.goal = 0;
  expect(() => configSchema.parse(c)).toThrow();
});

test('aceita até 8 módulos', () => {
  const c = structuredClone(exemplo);
  while (c.modules.length < 8) c.modules.push({ ...c.modules.find(m => m.type === 'contador'), key: 'c' + c.modules.length });
  expect(() => configSchema.parse(c)).not.toThrow();
});

test('identidade rejeita fonte com símbolo fora de letras/números/espaços', () => {
  expect(() => identitySchema.parse({ mood: 'natural', fonts: { display: 'Poppins;drop', body: 'Inter' }, icon: { symbol: 'leaf' }, illustration: 'leaf' })).toThrow();
});

test('identidade aceita fonte com letras, números e espaços', () => {
  expect(() => identitySchema.parse({ mood: 'natural', fonts: { display: 'Source Sans 3', body: 'Inter' }, icon: { symbol: 'leaf' }, illustration: 'leaf' })).not.toThrow();
});

test('biblioteca não aceita mais o tipo pdf', () => {
  const r = moduleSchemas.biblioteca.safeParse({ items: [{ title: 'Guia', type: 'pdf', url: 'https://x.com/a.pdf' }] });
  expect(r.success).toBe(false);
});

test('biblioteca aceita link, audio e video', () => {
  const r = moduleSchemas.biblioteca.safeParse({ items: [{ title: 'Guia', type: 'link', url: 'https://x.com/a' }] });
  expect(r.success).toBe(true);
});

test('guia do tipo texto exige blocos com body', () => {
  const r = moduleSchemas.guias.safeParse({ guides: [{ key: 'x', kind: 'texto', title: 'X', blocks: [] }] });
  expect(r.success).toBe(false);
});

test('guia do tipo texto aceita blocos e copiavel default true', () => {
  const r = moduleSchemas.guias.safeParse({ guides: [{ key: 'x', kind: 'texto', title: 'X', blocks: [{ body: 'corpo' }] }] });
  expect(r.success).toBe(true);
  expect(r.data.guides[0].blocks[0].copiavel).toBe(true);
});

test('guia do tipo audio rejeita url http (só https)', () => {
  const r = moduleSchemas.guias.safeParse({ guides: [{ key: 'x', kind: 'audio', title: 'X', tracks: [{ title: 'T', url: 'http://x.com/a.mp3' }] }] });
  expect(r.success).toBe(false);
});

test('guia do tipo audio aceita tracks com url https', () => {
  const r = moduleSchemas.guias.safeParse({ guides: [{ key: 'x', kind: 'audio', title: 'X', tracks: [{ title: 'T', url: 'https://x.com/a.mp3' }] }] });
  expect(r.success).toBe(true);
});

test('guia do tipo pagina exige seções com body', () => {
  const r = moduleSchemas.guias.safeParse({ guides: [{ key: 'x', kind: 'pagina', title: 'X', sections: [] }] });
  expect(r.success).toBe(false);
});

test('guia do tipo pagina aceita seções com checklist opcional (default [])', () => {
  const r = moduleSchemas.guias.safeParse({ guides: [{ key: 'x', kind: 'pagina', title: 'X', sections: [{ title: 'S', body: 'corpo' }] }] });
  expect(r.success).toBe(true);
  expect(r.data.guides[0].sections[0].checklist).toEqual([]);
});

test('quiz exige ao menos 1 pergunta e 1 perfil', () => {
  const r = moduleSchemas.quiz.safeParse({ questions: [], profiles: [] });
  expect(r.success).toBe(false);
});

test('quiz rejeita points que aponta pra perfil inexistente', () => {
  const r = moduleSchemas.quiz.safeParse({
    questions: [{ key: 'q1', text: 'Pergunta', options: [{ key: 'a', label: 'A', points: { fantasma: 1 } }] }],
    profiles: [{ key: 'p1', title: 'P1', description: 'd', ajustes: 'a' }],
  });
  expect(r.success).toBe(false);
});

test('quiz válido com onboarding default false', () => {
  const r = moduleSchemas.quiz.safeParse({
    questions: [{ key: 'q1', text: 'Pergunta', options: [{ key: 'a', label: 'A', points: { p1: 1 } }, { key: 'b', label: 'B', points: { p1: 0 } }] }],
    profiles: [{ key: 'p1', title: 'P1', description: 'd', ajustes: 'a' }],
  });
  expect(r.success).toBe(true);
  expect(r.data.onboarding).toBe(false);
});
