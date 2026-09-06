import { test, expect } from 'vitest';
import { TEXTOS, t, locales } from '@/lib/i18n';

// Coleta todas as chaves-folha (caminhos "grupo.chave") de uma árvore de
// textos, tratando arrays (ex.: diasSemanaIniciais) como folha — não desce
// dentro deles.
function chavesFolha(obj, prefixo = '') {
  let chaves = [];
  for (const [k, v] of Object.entries(obj)) {
    const caminho = prefixo ? `${prefixo}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      chaves = chaves.concat(chavesFolha(v, caminho));
    } else {
      chaves.push(caminho);
    }
  }
  return chaves;
}

test('locales() lista pt/es/en', () => {
  expect(locales().sort()).toEqual(['en', 'es', 'pt']);
});

test('todo locale tem exatamente o mesmo conjunto de chaves que o pt', () => {
  const chavesPt = chavesFolha(TEXTOS.pt).sort();
  for (const loc of locales()) {
    if (loc === 'pt') continue;
    const chaves = chavesFolha(TEXTOS[loc]).sort();
    expect(chaves, `locale ${loc} tem chaves diferentes do pt`).toEqual(chavesPt);
  }
});

test('arrays de dias da semana têm 7 posições em todo locale', () => {
  for (const loc of locales()) {
    expect(TEXTOS[loc].diasSemanaIniciais).toHaveLength(7);
    expect(TEXTOS[loc].diasSemanaNomes).toHaveLength(7);
  }
});

test('t() interpola variáveis simples', () => {
  expect(t('pt', 'hoje.seuDia', { n: 5 })).toBe('Seu dia 5');
  expect(t('es', 'protocolo.semanaN', { n: 2 })).toBe('Semana 2');
  expect(t('en', 'aulas.xDeYAulas', { x: 3, y: 10 })).toBe('3 of 10 lessons');
});

test('t() interpola múltiplas variáveis na mesma string', () => {
  expect(t('pt', 'protocolo.diasAaB', { a: 1, b: 7 })).toBe('dias 1 a 7');
  expect(t('en', 'eu.diaNdeM', { n: 3, m: 90 })).toBe('Day 3 of 90');
});

test('t() cai pro pt quando o locale é desconhecido', () => {
  expect(t('fr', 'hoje.diaFechado')).toBe(t('pt', 'hoje.diaFechado'));
  expect(t('xx', 'login.titulo')).toBe('Que bom te ver.');
});

test('t() devolve a própria chave quando ela não existe em nenhum locale', () => {
  expect(t('pt', 'grupo.inexistente')).toBe('grupo.inexistente');
});

test('rótulos das abas batem com o esperado em cada locale', () => {
  expect(t('pt', 'abas.hoje')).toBe('Hoje');
  expect(t('es', 'abas.hoje')).toBe('Hoy');
  expect(t('en', 'abas.hoje')).toBe('Today');
});

test('frase obrigatória da tela de login (es/en) bate com o texto exigido', () => {
  const es = `${t('es', 'login.fraseAntes')}${t('es', 'login.fraseDestaque')}${t('es', 'login.fraseDepois')}`;
  const en = `${t('en', 'login.fraseAntes')}${t('en', 'login.fraseDestaque')}${t('en', 'login.fraseDepois')}`;
  expect(es).toBe('Utiliza el correo de tu compra para acceder a la aplicación.');
  expect(en).toBe('Use the email from your purchase to access the app.');
});
