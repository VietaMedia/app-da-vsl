import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ratio, ajustarParaContraste, paletaValida, corrigirPaleta } from '../contraste.mjs';

test('ratio: preto sobre branco é 21:1', () => {
  const r = ratio('#000000', '#FFFFFF');
  assert.ok(Math.abs(r - 21) < 0.05, `esperado ~21, veio ${r}`);
});

test('ratio: cor contra ela mesma é 1:1', () => {
  const r = ratio('#336699', '#336699');
  assert.ok(Math.abs(r - 1) < 0.001);
});

test('ratio é simétrico', () => {
  const a = ratio('#2F6B3A', '#FBF7F0');
  const b = ratio('#FBF7F0', '#2F6B3A');
  assert.ok(Math.abs(a - b) < 1e-9);
});

test('ajustarParaContraste: melhora um contraste insuficiente', () => {
  const antes = ratio('#CCCCCC', '#FFFFFF');
  assert.ok(antes < 4.5);
  const ajustado = ajustarParaContraste('#CCCCCC', '#FFFFFF', 4.5);
  const depois = ratio(ajustado, '#FFFFFF');
  assert.ok(depois >= 4.5, `esperava >= 4.5, veio ${depois}`);
});

test('ajustarParaContraste: não mexe numa cor que já passa', () => {
  const cor = '#000000';
  const ajustado = ajustarParaContraste(cor, '#FFFFFF', 4.5);
  assert.equal(ajustado, cor);
});

test('paletaValida: acusa texto com contraste baixo', () => {
  const problemas = paletaValida({ text: '#CCCCCC', background: '#FFFFFF', surface: '#FFFFFF' });
  assert.ok(problemas.some((p) => p.includes('texto sobre fundo')));
});

test('paletaValida: acusa primaryDark mais clara que primary', () => {
  const problemas = paletaValida({ primary: '#333333', primaryDark: '#999999' });
  assert.ok(problemas.some((p) => p.includes('primária escura')));
});

test('paletaValida: paleta correta não acusa nada', () => {
  const problemas = paletaValida({
    primary: '#2F6B3A', primaryDark: '#1F4A28', accent: '#E07A2F',
    background: '#FBF7F0', surface: '#FFFFFF', text: '#1F2A1F',
  });
  assert.deepEqual(problemas, []);
});

test('corrigirPaleta: resultado sempre passa em paletaValida', () => {
  const theme = { primary: '#AAAAAA', primaryDark: '#BBBBBB', accent: '#DDDDDD', background: '#FFFFFF', surface: '#FFFFFF', text: '#DDDDDD' };
  const corrigido = corrigirPaleta(theme);
  const problemas = paletaValida(corrigido);
  assert.deepEqual(problemas, [], `ainda há problemas: ${JSON.stringify(problemas)}`);
});
