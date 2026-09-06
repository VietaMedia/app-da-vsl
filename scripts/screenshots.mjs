#!/usr/bin/env node
// screenshots.mjs — percorre o app publicado tirando screenshots do celular (390x844,
// e a tela Hoje também em 360/430) e roda a VERIFICACAO automática de qualidade mobile
// (PADRAO-DE-QUALIDADE.md §5) nas páginas principais.
//
// Generalizado a partir de apps/programa-active/.tooling/screenshots.mjs:
// não depende de rótulos em português (busca por button[type=submit],
// [data-acao="comecar"], com fallback por regex PT/EN/ES) e roda a verificação
// automática das regras de cartão/overflow/fonte/imagem.
//
// uso: node screenshots.mjs <baseUrl> <email> <pastaSaida> [--pin X] [--idioma pt|en|es]

import { chromium } from 'playwright';
import fs from 'node:fs';

function parseArgs(argv) {
  const pos = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pin') { opts.pin = argv[++i]; }
    else if (a === '--idioma') { opts.idioma = argv[++i]; }
    else pos.push(a);
  }
  return { pos, opts };
}

const { pos, opts } = parseArgs(process.argv.slice(2));
const [base = 'http://localhost:3000', email = 'piloto@exemplo.com', out = './screenshots'] = pos;
const pin = opts.pin;
const LOCALES = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
const locale = LOCALES[opts.idioma] ?? 'pt-BR';

fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale });
const page = await ctx.newPage();
const shots = [];

async function shot(name, full = true) {
  const f = `${out}/${name}.png`;
  await page.screenshot({ path: f, fullPage: full });
  shots.push(f);
  console.log('shot', name);
}

// O template deveria carregar data-acao="continuar"/"comecar" nos botões (nota:
// esta skill não pode alterar o template — ver docs/PUBLICAR.md ou o briefing da
// skill). Enquanto isso não existir, caímos no fallback: button[type=submit] pro
// botão de continuar, e um regex PT/EN/ES pro botão de começar.
const REGEX_COMECAR = /começar|comenzar|empezar|start|begin/i;
const REGEX_CONTINUAR = /continuar|continue/i;

async function clicarContinuar() {
  const porAcao = page.locator('[data-acao="continuar"]');
  if (await porAcao.count()) { await porAcao.first().click(); return true; }
  const porSubmit = page.locator('button[type="submit"]:not([aria-label])').filter({ hasNotText: /começar|comenzar|start/i });
  if (await porSubmit.count()) { await porSubmit.last().click(); return true; }
  const porTexto = page.getByRole('button', { name: REGEX_CONTINUAR });
  if (await porTexto.count()) { await porTexto.first().click(); return true; }
  return false;
}

async function clicarComecar() {
  try { await page.getByRole('button', { name: REGEX_COMECAR }).first().waitFor({ timeout: 6000 }); } catch {}
  const porAcao = page.locator('[data-acao="comecar"]');
  if (await porAcao.count()) { await porAcao.first().click(); return true; }
  const porTexto = page.getByRole('button', { name: REGEX_COMECAR });
  if (await porTexto.count()) { await porTexto.first().click(); return true; }
  return false;
}

await page.goto(`${base}/entrar`, { waitUntil: 'networkidle' }); await shot('01-entrar', false);
const r = await ctx.request.post(`${base}/api/auth/login`, { data: pin ? { email, pin } : { email } });
console.log('login', r.status(), await r.text());

// primeiro acesso → avaliação
await page.goto(`${base}/app`, { waitUntil: 'networkidle' }); await page.waitForTimeout(700); await shot('02-avaliacao-ou-hoje', false);
if (page.url().includes('/app/avaliacao')) {
  const preencherTexto = async () => {
    const campo = page.locator('input[type="text"], input:not([type]), input[type="email"]').filter({ hasNot: page.locator('[readonly]') }).first();
    if (await campo.count() && !(await campo.inputValue())) await campo.fill('Juliana');
  };
  await preencherTexto();
  await clicarContinuar();
  // percorre a avaliação inteira (nome → calculadora → quiz → carregando → resultado → começar)
  let vazio = 0;
  for (let i = 0; i < 40; i++) {
    if (/\/app$/.test(page.url())) break;
    const estado = await page.evaluate(() => ({
      inputs: [...document.querySelectorAll('input')].map((el) => el.value),
      botoes: [...document.querySelectorAll('button')].map((b) => ({ t: (b.textContent || '').trim(), type: b.type, aria: b.getAttribute('aria-label') })),
    }));
    if (process.env.DEBUG_ROTEIRO) console.log('passo', i, page.url().replace(base, ''), JSON.stringify(estado));
    if (!estado.botoes.length) { vazio++; if (vazio > 10) break; await page.waitForTimeout(600); continue; }
    vazio = 0;
    // preenche o que estiver vazio: texto recebe um nome, número recebe um valor plausível
    const vazios = page.locator('input:not([type=checkbox]):not([type=radio]):not([readonly])');
    for (let k = 0; k < await vazios.count(); k++) {
      const el = vazios.nth(k);
      if (await el.inputValue()) continue;
      const tipo = (await el.getAttribute('type')) || 'text';
      const inputmode = (await el.getAttribute('inputmode')) || '';
      const numerico = tipo === 'number' || /numeric|decimal/.test(inputmode);
      await el.fill(numerico ? String(10 + k * 5) : 'Juliana').catch(() => {});
    }
    // só o botão de envio conta como "começar": uma opção de quiz como "Não sei por onde começar" não é
    const comecar = estado.botoes.find((b) => b.type === 'submit' && REGEX_COMECAR.test(b.t));
    const submit = estado.botoes.find((b) => b.type === 'submit' && !b.aria && !REGEX_COMECAR.test(b.t));
    const opcao = estado.botoes.find((b) => b.type !== 'submit' && !b.aria && b.t.length >= 3 && !/ajustes|adjust/i.test(b.t));
    if (i === 6) await shot('02b-avaliacao-meio', false);
    if (comecar) {
      await shot('03-avaliacao-resultado', false);
      // o botão final não tem atributo type (a propriedade DOM diz "submit"), então clica pelo texto exato
      await page.getByRole('button', { name: comecar.t, exact: true }).first().click({ timeout: 8000 }).catch(() => {});
      try { await page.waitForURL(/\/app$/, { timeout: 15000 }); } catch {}
      break;
    }
    // a tela pode trocar entre a leitura do DOM e o clique (ex.: "carregando" que avança sozinho):
    // clique curto e tolerante; se o botão sumiu, só segue pro próximo ciclo
    if (submit) await page.locator('button[type="submit"]:not([aria-label])').last().click({ timeout: 4000 }).catch(() => {});
    else if (opcao) await page.getByRole('button', { name: opcao.t.slice(0, 25) }).first().click({ timeout: 4000 }).catch(() => {});
    else { vazio++; if (vazio > 10) break; await page.waitForTimeout(700); continue; } // só "Voltar": tela ainda montando
    await page.waitForTimeout(700);
  }
}

await page.goto(`${base}/app`, { waitUntil: 'networkidle' }); await page.waitForTimeout(900); await shot('04-hoje');
// se a avaliação não terminou, "04-hoje" é a avaliação de novo — isso é falha, não sucesso
const onboardingIncompleto = page.url().includes('/app/avaliacao');
const cb = page.locator('input[type="checkbox"]').first();
if (await cb.count()) { await cb.check({ force: true }); await page.waitForTimeout(600); }
await shot('05-hoje-apos-check', false);

for (const [rota, nome] of [['protocolo', '06-protocolo'], ['protocolo/1', '07-protocolo-dia-1'], ['aulas', '08-aulas'], ['kit', '10-kit'], ['eu', '12-eu']]) {
  await page.goto(`${base}/app/${rota}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(800); await shot(nome);
}

await page.goto(`${base}/app/aulas`, { waitUntil: 'networkidle' });
const sec = await page.locator('a[href^="/app/aulas/"]').first().getAttribute('href');
if (sec) {
  await page.goto(base + sec, { waitUntil: 'networkidle' }); await page.waitForTimeout(700); await shot('09-aulas-secao');
  const step = await page.locator(`a[href^="${sec}/"]`).first().getAttribute('href');
  if (step) { await page.goto(base + step, { waitUntil: 'networkidle' }); await page.waitForTimeout(600); await shot('09b-aula'); }
}

await page.goto(`${base}/app/kit`, { waitUntil: 'networkidle' });
const guias = await page.locator('a[href^="/app/kit/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
for (const [i, g] of guias.slice(0, 3).entries()) {
  await page.goto(base + g, { waitUntil: 'networkidle' }); await page.waitForTimeout(600); await shot(`11${'abc'[i]}-kit-${g.split('/').pop()}`);
}

for (const w of [360, 430]) {
  await page.setViewportSize({ width: w, height: 844 });
  await page.goto(`${base}/app`, { waitUntil: 'networkidle' }); await page.waitForTimeout(600); await shot(`13-hoje-${w}`, false);
}

// ---------- VERIFICACAO automática (PADRAO-DE-QUALIDADE.md §5) ----------

const PAGINAS = ['/app', '/app/protocolo', '/app/aulas', '/app/kit', '/app/eu'];
const LARGURAS = [360, 390, 430];
const problemas = [];
if (onboardingIncompleto) problemas.push({ pagina: 'avaliacao', regra: 'onboarding-concluido', seletor: 'url', valor: 'avaliação não chegou ao fim (o roteiro não alcançou /app)' });

async function checarPagina(rota) {
  // (a) conteúdo nunca encosta na borda lateral do cartão: margem lateral efetiva >= 12px
  // (padding do próprio .card, ou — em cartões-moldura/lista — o padding lateral de TODO filho direto)
  const cardsProblema = await page.evaluate(() => {
    const ruins = [];
    const lat = (el) => { const cs = getComputedStyle(el); return [parseFloat(cs.paddingLeft), parseFloat(cs.paddingRight)]; };
    document.querySelectorAll('.card').forEach((el, i) => {
      const [pl, pr] = lat(el);
      if (pl >= 12 && pr >= 12) return;
      const filhos = [...el.children].filter((f) => getComputedStyle(f).display !== 'none');
      const ok = filhos.length > 0 && filhos.every((f) => {
        if (f.classList.contains('card')) return true;
        const [fl, fr] = lat(f);
        const ml = parseFloat(getComputedStyle(f).marginLeft) || 0, mr = parseFloat(getComputedStyle(f).marginRight) || 0;
        return (pl + fl + ml) >= 12 && (pr + fr + mr) >= 12;
      });
      if (!ok) ruins.push({ seletor: `.card:nth-of-type(${i + 1})`, valor: `${pl}/${pr}` });
    });
    return ruins;
  });
  for (const c of cardsProblema) problemas.push({ pagina: rota, regra: 'card-padding>=12px', seletor: c.seletor, valor: c.valor });

  // (c) nenhum p/li/span dentro de .card com font-size < 15px, salvo rótulo
  // (data-rotulo, ou >=12px e texto curto <=24 chars)
  const fontesProblema = await page.evaluate(() => {
    const ruins = [];
    document.querySelectorAll('.card p, .card li, .card span').forEach((el, i) => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      if (fs >= 15) return;
      if (el.hasAttribute('data-rotulo')) return;
      const texto = (el.textContent || '').trim();
      if (fs >= 12 && texto.length <= 24) return; // rótulo curto tolerado
      ruins.push({ seletor: `${el.tagName.toLowerCase()}:nth-of-type(${i + 1})`, valor: `${fs}px "${texto.slice(0, 30)}"` });
    });
    return ruins;
  });
  for (const f of fontesProblema) problemas.push({ pagina: rota, regra: 'fonte-corpo>=15px', seletor: f.seletor, valor: f.valor });

  // (d) imagem/ícone não pode ultrapassar o cartão que o contém
  const overflowImagens = await page.evaluate(() => {
    const ruins = [];
    document.querySelectorAll('.card img, .card svg').forEach((el, i) => {
      const card = el.closest('.card');
      if (!card) return;
      const rEl = el.getBoundingClientRect();
      const rCard = card.getBoundingClientRect();
      const fora = rEl.left < rCard.left - 0.5 || rEl.right > rCard.right + 0.5 || rEl.top < rCard.top - 0.5 || rEl.bottom > rCard.bottom + 0.5;
      if (fora) ruins.push({ seletor: `${el.tagName.toLowerCase()}:nth-of-type(${i + 1})`, valor: `elemento ${Math.round(rEl.width)}x${Math.round(rEl.height)} fora do cartão ${Math.round(rCard.width)}x${Math.round(rCard.height)}` });
    });
    return ruins;
  });
  for (const o of overflowImagens) problemas.push({ pagina: rota, regra: 'imagem-dentro-do-cartao', seletor: o.seletor, valor: o.valor });
}

for (const rota of PAGINAS) {
  for (const largura of LARGURAS) {
    await page.setViewportSize({ width: largura, height: 844 });
    await page.goto(`${base}${rota}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // (b) sem scroll horizontal
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) {
      problemas.push({ pagina: `${rota}@${largura}`, regra: 'sem-scroll-horizontal', seletor: 'html', valor: `scrollWidth>clientWidth em ${largura}px` });
    }

    if (largura === 390) await checarPagina(rota);
  }
}

const verificacaoOk = problemas.length === 0;
fs.writeFileSync(`${out}/verificacao.json`, JSON.stringify({ ok: verificacaoOk, problemas }, null, 2));

console.log();
if (verificacaoOk) {
  console.log('VERIFICACAO: OK');
} else {
  console.log('VERIFICACAO: FALHOU');
  console.log('pagina | regra | seletor | valor');
  for (const p of problemas) console.log(`${p.pagina} | ${p.regra} | ${p.seletor} | ${p.valor}`);
}

await browser.close();
console.log(JSON.stringify({ shots }, null, 0));

process.exit(verificacaoOk ? 0 : 2);
