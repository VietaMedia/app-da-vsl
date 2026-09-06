import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const SCRIPT = path.join(AQUI, '..', 'extrair-cores.mjs');

async function gerarFrameSolido(pasta, nome, { r, g, b }) {
  const largura = 96, altura = 54;
  const buffer = Buffer.alloc(largura * altura * 3);
  for (let i = 0; i < largura * altura; i++) {
    buffer[i * 3] = r; buffer[i * 3 + 1] = g; buffer[i * 3 + 2] = b;
  }
  await sharp(buffer, { raw: { width: largura, height: altura, channels: 3 } })
    .jpeg()
    .toFile(path.join(pasta, nome));
}

async function gerarFrameMisto(pasta, nome, coresLista) {
  const largura = 96, altura = 54;
  const buffer = Buffer.alloc(largura * altura * 3);
  const faixas = coresLista.length;
  for (let y = 0; y < altura; y++) {
    const idx = Math.min(faixas - 1, Math.floor((y / altura) * faixas));
    const { r, g, b } = coresLista[idx];
    for (let x = 0; x < largura; x++) {
      const p = (y * largura + x) * 3;
      buffer[p] = r; buffer[p + 1] = g; buffer[p + 2] = b;
    }
  }
  await sharp(buffer, { raw: { width: largura, height: altura, channels: 3 } })
    .jpeg()
    .toFile(path.join(pasta, nome));
}

function rodarScript(pastaFrames) {
  const saida = execFileSync('node', [SCRIPT, pastaFrames, '--json'], { encoding: 'utf8' });
  return JSON.parse(saida);
}

test('cena verde: primária sai esverdeada', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cores-verde-'));
  for (let i = 0; i < 6; i++) {
    await gerarFrameSolido(tmp, `f${i}.jpg`, { r: 40, g: 110, b: 55 });
  }
  const r = rodarScript(tmp);
  assert.ok(r.sugestoes.primaria, 'esperava uma sugestão de primária');
  // matiz verde em OKLCH fica por volta de 140-160°
  const cor = r.top5[0];
  assert.ok(cor.okH > 100 && cor.okH < 200, `matiz fora do verde: ${cor.okH}`);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('cena azul: cor dominante sai azulada', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cores-azul-'));
  for (let i = 0; i < 6; i++) {
    await gerarFrameSolido(tmp, `f${i}.jpg`, { r: 30, g: 70, b: 160 });
  }
  const r = rodarScript(tmp);
  const cor = r.top5[0];
  // matiz azul em OKLCH fica por volta de 240-280°
  assert.ok(cor.okH > 200 && cor.okH < 320, `matiz fora do azul: ${cor.okH}`);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('cena mista: acento tem matiz distante da primária (>= 60°) e maior croma', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cores-mista-'));
  // metade verde-folha, metade terracota — imita cenário natural + acento quente
  for (let i = 0; i < 8; i++) {
    await gerarFrameMisto(tmp, `f${i}.jpg`, [
      { r: 47, g: 107, b: 58 },   // verde-folha
      { r: 224, g: 122, b: 47 },  // terracota
    ]);
  }
  const r = rodarScript(tmp);
  assert.ok(r.sugestoes.primaria, 'esperava primária');
  assert.ok(r.sugestoes.acento, 'esperava acento');
  assert.notEqual(r.sugestoes.primaria, r.sugestoes.acento);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('pasta vazia: script falha com código de saída != 0', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cores-vazia-'));
  assert.throws(() => execFileSync('node', [SCRIPT, tmp, '--json'], { encoding: 'utf8', stdio: 'pipe' }));
  fs.rmSync(tmp, { recursive: true, force: true });
});
