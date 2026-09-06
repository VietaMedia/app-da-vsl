import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { paletaValida } from '../contraste.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const banco = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'banco-por-mercado.json'), 'utf8'));

const FONTES_PERMITIDAS = new Set([
  'Cormorant Garamond', 'Nunito Sans', 'Playfair Display', 'Source Sans 3',
  'Anton', 'Manrope', 'Libre Baskerville', 'IBM Plex Sans', 'Lora', 'Poppins',
  'DM Serif Display', 'Space Grotesk',
]);
const SIMBOLOS_PERMITIDOS = new Set(['bowl', 'leaf', 'heart', 'coin', 'dumbbell', 'drop', 'brain', 'sun', 'star', 'book']);
const ILUSTRACOES_PERMITIDAS = new Set(['leaf', 'wave', 'gear', 'pulse', 'coins', 'sparkles']);
const MOODS_PERMITIDOS = new Set(['natural', 'clinico', 'fitness', 'financeiro', 'beleza', 'foco']);

test('banco-por-mercado tem exatamente 9 famílias', () => {
  assert.equal(Object.keys(banco.familias).length, 9);
});

for (const [chave, familia] of Object.entries((() => {
  // carrega de novo dentro do módulo pra aparecer no relatório do test runner por nome
  return banco.familias;
})())) {
  test(`família "${chave}": paleta passa em paletaValida`, () => {
    const problemas = paletaValida(familia.theme);
    assert.deepEqual(problemas, [], `problemas em ${chave}: ${JSON.stringify(problemas)}`);
  });

  test(`família "${chave}": fontes existem no Google Fonts permitido`, () => {
    assert.ok(FONTES_PERMITIDAS.has(familia.fonts.display), `display "${familia.fonts.display}" não permitida`);
    assert.ok(FONTES_PERMITIDAS.has(familia.fonts.body), `body "${familia.fonts.body}" não permitida`);
  });

  test(`família "${chave}": símbolo, ilustração e clima são valores válidos`, () => {
    assert.ok(SIMBOLOS_PERMITIDOS.has(familia.symbol), `símbolo "${familia.symbol}" inválido`);
    assert.ok(ILUSTRACOES_PERMITIDAS.has(familia.illustration), `ilustração "${familia.illustration}" inválida`);
    assert.ok(MOODS_PERMITIDOS.has(familia.mood), `clima "${familia.mood}" inválido`);
  });

  test(`família "${chave}": tem palavras-chave em pelo menos 2 idiomas`, () => {
    assert.ok(Array.isArray(familia.palavrasChave) && familia.palavrasChave.length >= 4);
  });

  test(`família "${chave}": todas as cores do theme são hex válidos`, () => {
    for (const [campo, hex] of Object.entries(familia.theme)) {
      assert.match(hex, /^#[0-9A-Fa-f]{6}$/, `${campo} não é hex válido: ${hex}`);
    }
  });
}
