#!/usr/bin/env node
// extrair-cores.mjs — extrai as cores dominantes de uma pasta de frames (1 por minuto da VSL)
// e sugere primária/acento/fundo pra identidade visual do app.
//
// uso: node extrair-cores.mjs <pastaFrames> [--json] [--sharp <dirComSharp>]

import fs from 'node:fs';
import path from 'node:path';
import { hexParaOklch, oklchParaHex } from './contraste.mjs';

function resolverSharp(argSharpDir) {
  const candidatos = [];
  if (argSharpDir) candidatos.push(argSharpDir);
  candidatos.push(path.join(process.cwd(), 'node_modules'));
  candidatos.push(new URL('./node_modules', import.meta.url).pathname);
  for (const dir of candidatos) {
    try {
      const p = path.join(dir, 'sharp', 'lib', 'index.js');
      if (fs.existsSync(p)) return p;
    } catch { /* ignora */ }
  }
  return null;
}

async function carregarSharp(argSharpDir) {
  const local = resolverSharp(argSharpDir);
  if (local) {
    const mod = await import(`file://${local}`);
    return mod.default ?? mod;
  }
  // fallback: tenta resolver via node normal (funciona se rodado de dentro da pasta scripts/)
  try {
    const mod = await import('sharp');
    return mod.default ?? mod;
  } catch {
    console.error('Não achei o pacote "sharp". Rode: cd "' + path.dirname(new URL(import.meta.url).pathname) + '" && npm install');
    process.exit(1);
  }
}

// ---------- OKLab (independente do contraste.mjs pra amostragem em massa) ----------

function srgbParaLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbParaOklab(r, g, b) {
  const R = srgbParaLinear(r / 255), G = srgbParaLinear(g / 255), B = srgbParaLinear(b / 255);
  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

function oklabParaHexRgb(lab) {
  const { L, a, b } = lab;
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const linearParaSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(linearParaSrgb(v) * 255)));
  const h = (v) => clamp(v).toString(16).padStart(2, '0');
  return `#${h(R)}${h(G)}${h(B)}`;
}

function oklabParaOklch({ L, a, b }) {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function distHue(h1, h2) {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}

// ---------- k-means em OKLab ----------

function kmeans(pontos, k, iteracoes = 20) {
  // init determinístico: espalha centros iniciais ao longo da luminosidade (ordenada)
  const ordenados = [...pontos].sort((a, b) => a.L - b.L);
  const centros = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i / (k - 1 || 1)) * (ordenados.length - 1));
    centros.push({ ...ordenados[idx] });
  }

  let atribuicoes = new Array(pontos.length).fill(0);
  for (let it = 0; it < iteracoes; it++) {
    // atribui
    for (let i = 0; i < pontos.length; i++) {
      let melhor = 0, melhorDist = Infinity;
      for (let c = 0; c < centros.length; c++) {
        const p = pontos[i], ce = centros[c];
        const d = (p.L - ce.L) ** 2 + (p.a - ce.a) ** 2 + (p.b - ce.b) ** 2;
        if (d < melhorDist) { melhorDist = d; melhor = c; }
      }
      atribuicoes[i] = melhor;
    }
    // recalcula centros
    const somas = centros.map(() => ({ L: 0, a: 0, b: 0, n: 0 }));
    for (let i = 0; i < pontos.length; i++) {
      const s = somas[atribuicoes[i]];
      s.L += pontos[i].L; s.a += pontos[i].a; s.b += pontos[i].b; s.n++;
    }
    for (let c = 0; c < centros.length; c++) {
      if (somas[c].n > 0) {
        centros[c] = { L: somas[c].L / somas[c].n, a: somas[c].a / somas[c].n, b: somas[c].b / somas[c].n };
      }
    }
  }

  const contagens = new Array(k).fill(0);
  for (const a of atribuicoes) contagens[a]++;
  return centros.map((c, i) => ({ centro: c, contagem: contagens[i] }));
}

async function extrairPontosDeFrame(sharp, arquivo) {
  const { data, info } = await sharp(arquivo)
    .resize(48, 27, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pontos = [];
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    pontos.push(rgbParaOklab(r, g, b));
  }
  return pontos;
}

async function main() {
  const args = process.argv.slice(2);
  const pastaFrames = args.find((a) => !a.startsWith('--'));
  const querJson = args.includes('--json');
  const idxSharp = args.indexOf('--sharp');
  const sharpDir = idxSharp >= 0 ? args[idxSharp + 1] : null;

  if (!pastaFrames) {
    console.error('uso: node extrair-cores.mjs <pastaFrames> [--json] [--sharp <dir>]');
    process.exit(1);
  }
  if (!fs.existsSync(pastaFrames)) {
    console.error(`pasta não encontrada: ${pastaFrames}`);
    process.exit(1);
  }

  const sharp = await carregarSharp(sharpDir);

  const arquivos = fs.readdirSync(pastaFrames)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort()
    .map((f) => path.join(pastaFrames, f));

  if (arquivos.length === 0) {
    console.error('nenhum frame (.jpg/.png) encontrado na pasta.');
    process.exit(1);
  }

  // amostra até 40 frames espalhados uniformemente
  const N = Math.min(40, arquivos.length);
  const amostrados = [];
  for (let i = 0; i < N; i++) {
    const idx = Math.floor((i / N) * arquivos.length);
    amostrados.push(arquivos[idx]);
  }

  let todosPontos = [];
  for (const arq of amostrados) {
    try {
      const pontos = await extrairPontosDeFrame(sharp, arq);
      todosPontos = todosPontos.concat(pontos);
    } catch (e) {
      console.error(`aviso: falhou ao ler ${arq}: ${e.message}`);
    }
  }

  if (todosPontos.length === 0) {
    console.error('não consegui extrair pixels de nenhum frame.');
    process.exit(1);
  }

  const K = 8;
  const clusters = kmeans(todosPontos, K, 20);
  const totalPixels = todosPontos.length;

  const todos = clusters
    .map(({ centro, contagem }) => {
      const oklch = oklabParaOklch(centro);
      const hex = oklabParaHexRgb(centro);
      return { hex, share: contagem / totalPixels, okL: oklch.L, okC: oklch.C, okH: oklch.H };
    })
    .sort((a, b) => b.share - a.share);

  if (args.includes('--debug')) {
    console.error('clusters brutos (antes do filtro):');
    for (const c of todos) console.error(`  ${c.hex}  share=${(c.share*100).toFixed(1)}%  L=${c.okL.toFixed(4)}  C=${c.okC.toFixed(4)}  H=${c.okH.toFixed(0)}`);
  }

  const candidatos = todos.filter((c) => c.okC >= 0.04 && c.okL >= 0.12 && c.okL <= 0.95);

  const top5 = candidatos.slice(0, 5);

  // sugestões
  const primariaCand = candidatos.filter((c) => c.okL >= 0.30 && c.okL <= 0.58);
  const primaria = primariaCand.length ? primariaCand.reduce((a, b) => (a.share >= b.share ? a : b)) : (top5[0] ?? null);

  let acento = null;
  if (primaria) {
    const distantesDePrimaria = candidatos
      .filter((c) => c.hex !== primaria.hex && distHue(c.okH, primaria.okH) >= 60)
      .sort((a, b) => b.okC - a.okC);
    acento = distantesDePrimaria[0] ?? null;
  }
  if (!acento) {
    acento = candidatos.filter((c) => c.hex !== (primaria?.hex)).sort((a, b) => b.okC - a.okC)[0] ?? null;
  }

  const fundoCand = candidatos
    .filter((c) => c.okL >= 0.9)
    .sort((a, b) => a.okC - b.okC);
  const fundo = fundoCand[0] ? fundoCand[0].hex : '#FBF7F0';

  const resultado = {
    frames_amostrados: amostrados.length,
    top5,
    sugestoes: {
      primaria: primaria ? primaria.hex : null,
      acento: acento ? acento.hex : null,
      fundo,
    },
  };

  if (querJson) {
    console.log(JSON.stringify(resultado, null, 2));
  } else {
    console.log(`Frames amostrados: ${resultado.frames_amostrados}`);
    console.log();
    console.log('Top cores dominantes:');
    console.log('  hex      share   L      C      H');
    for (const c of top5) {
      console.log(`  ${c.hex}  ${(c.share * 100).toFixed(1).padStart(5)}%  ${c.okL.toFixed(2)}  ${c.okC.toFixed(2)}  ${c.okH.toFixed(0).padStart(3)}°`);
    }
    console.log();
    console.log('Sugestões:');
    console.log(`  primária: ${resultado.sugestoes.primaria}`);
    console.log(`  acento:   ${resultado.sugestoes.acento}`);
    console.log(`  fundo:    ${resultado.sugestoes.fundo}`);
  }
}

main();
