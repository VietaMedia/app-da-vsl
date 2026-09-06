import { test, expect } from 'vitest';
import { hojeISO, diasEntre, validarData, dataFormatadaPara, localeIntl } from '@/lib/dates';
test('hojeISO tem formato YYYY-MM-DD', () => { expect(hojeISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/); });
test('diasEntre conta dias de calendário', () => { expect(diasEntre('2026-09-01', '2026-09-05')).toBe(4); });

test('validarData aceita data válida não futura', () => {
  expect(validarData('2026-09-01', '2026-09-05')).toBe(true);
  expect(validarData('2026-09-05', '2026-09-05')).toBe(true);
});
test('validarData rejeita formato errado', () => {
  expect(validarData('01/09/2026', '2026-09-05')).toBe(false);
  expect(validarData('2026-9-1', '2026-09-05')).toBe(false);
});
test('validarData rejeita data de calendário inexistente', () => {
  expect(validarData('2026-02-30', '2026-09-05')).toBe(false);
});
test('validarData rejeita data futura', () => {
  expect(validarData('2026-09-06', '2026-09-05')).toBe(false);
});

test('localeIntl mapeia pt/es/en e cai pro pt-BR por padrão', () => {
  expect(localeIntl('pt')).toBe('pt-BR');
  expect(localeIntl('es')).toBe('es-ES');
  expect(localeIntl('en')).toBe('en-US');
  expect(localeIntl('fr')).toBe('pt-BR');
});

test('dataFormatadaPara capitaliza a primeira letra em cada locale', () => {
  const pt = dataFormatadaPara('2026-09-05', 'pt');
  const es = dataFormatadaPara('2026-09-05', 'es');
  const en = dataFormatadaPara('2026-09-05', 'en');
  expect(pt[0]).toBe(pt[0].toUpperCase());
  expect(es[0]).toBe(es[0].toUpperCase());
  expect(en[0]).toBe(en[0].toUpperCase());
  expect(en).toMatch(/September/);
});
