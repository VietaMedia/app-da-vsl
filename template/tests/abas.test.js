import { test, expect } from 'vitest';
import { abasDoConfig, barraVisivel } from '@/lib/abas';
import exemplo from '../app.config.exemplo.json';

test('abasDoConfig com o exemplo (tem protocolo, trilha e guias)', () => {
  const chaves = abasDoConfig(exemplo).map(a => a.key);
  expect(chaves).toEqual(['hoje', 'protocolo', 'aulas', 'kit', 'eu']);
});

test('abasDoConfig sem trilha não inclui aulas', () => {
  const semTrilha = { ...exemplo, modules: exemplo.modules.filter(m => m.type !== 'trilha') };
  const chaves = abasDoConfig(semTrilha).map(a => a.key);
  expect(chaves).not.toContain('aulas');
  expect(chaves).toEqual(['hoje', 'protocolo', 'kit', 'eu']);
});

test('abasDoConfig sempre tem hoje e eu, nesta ordem nas pontas', () => {
  const chaves = abasDoConfig({ modules: [] }).map(a => a.key);
  expect(chaves).toEqual(['hoje', 'eu']);
});

test('barraVisivel: some em /app/avaliacao e em subrotas dela', () => {
  expect(barraVisivel('/app/avaliacao')).toBe(false);
  expect(barraVisivel('/app/avaliacao/passo-2')).toBe(false);
});

test('barraVisivel: aparece em qualquer outra rota do app', () => {
  expect(barraVisivel('/app')).toBe(true);
  expect(barraVisivel('/app/eu')).toBe(true);
  expect(barraVisivel(undefined)).toBe(true);
});

test('abasDoConfig traduz os rótulos conforme app.locale', () => {
  const emEspanhol = { ...exemplo, app: { ...exemplo.app, locale: 'es' } };
  const rotulos = abasDoConfig(emEspanhol).map(a => a.label);
  expect(rotulos).toEqual(['Hoy', 'Protocolo', 'Clases', 'Kit', 'Yo']);
});

test('abasDoConfig sem locale (ou locale desconhecido) usa pt', () => {
  const semLocale = { ...exemplo, app: { ...exemplo.app, locale: undefined } };
  expect(abasDoConfig(semLocale).map(a => a.label)).toEqual(['Hoje', 'Protocolo', 'Aulas', 'Kit', 'Eu']);
});
