#!/usr/bin/env node
// Decide entre publicar no plano Business ou numa VPS da Hostinger.
// Função PURA: recebe as respostas já salvas de hosting_listWebsitesV1 e
// VPS_getVirtualMachinesV1. Não fala com a rede — MCP quem chama é o Claude.
import fs from 'node:fs';

const LIMITE_BUSINESS = 2; // ver memória hostinger-business-limite-apps

function lista(x) {
  if (Array.isArray(x)) return x;
  if (x && Array.isArray(x.data)) return x.data;
  if (x && Array.isArray(x.websites)) return x.websites;
  return [];
}

function ipDaVm(vm) {
  const v4 = vm.ipv4 || vm.ipv4_addresses || [];
  if (Array.isArray(v4) && v4.length) return v4[0].address || v4[0].ip || String(v4[0]);
  return vm.ip_address || vm.ip || null;
}

export function decidirDestino({ sites, vms }) {
  const nodes = lista(sites).filter((s) => {
    const t = String(s.type || s.platform || 'node').toLowerCase();
    return t === 'node' || t === 'nodejs' || t === 'node.js';
  });
  const orderId = nodes.length ? String(nodes[0].order_id ?? nodes[0].orderId ?? '') || null : null;

  const maquinas = lista(vms)
    .filter((v) => String(v.state || v.status || '').toLowerCase() === 'running')
    .map((v) => ({
      id: Number(v.id),
      hostname: v.hostname || v.name || `vps-${v.id}`,
      ip: ipDaVm(v),
      estado: 'running',
    }));

  const business = {
    disponivel: lista(sites).length > 0 || nodes.length > 0,
    quantidadeSites: nodes.length,
    orderId,
    motivo: nodes.length >= LIMITE_BUSINESS
      ? `o plano já tem ${nodes.length} apps Node; acima de ${LIMITE_BUSINESS} o MySQL da conta engasga`
      : nodes.length > 0
        ? `o plano tem ${nodes.length} app(s) Node e cabe mais`
        : 'o plano existe e está vazio',
  };
  if (!business.disponivel) business.motivo = 'nenhum site de hospedagem encontrado na conta';

  const vps = {
    disponivel: maquinas.length > 0,
    maquinas,
    motivo: maquinas.length
      ? `${maquinas.length} VPS ligada(s)`
      : 'nenhuma VPS ligada na conta',
  };

  let recomendacao;
  let frase;
  if (vps.disponivel && business.disponivel) {
    if (business.quantidadeSites >= LIMITE_BUSINESS) {
      recomendacao = 'vps';
      frase = `Vou publicar na VPS: ${business.motivo}.`;
    } else {
      recomendacao = 'perguntar';
      frase = 'Você tem os dois: o plano de hospedagem e uma VPS. Onde publico este app?';
    }
  } else if (vps.disponivel) {
    recomendacao = 'vps';
    frase = `Vou publicar na sua VPS (${maquinas[0].hostname}).`;
  } else if (business.disponivel) {
    recomendacao = 'business';
    frase = 'Vou publicar no seu plano de hospedagem da Hostinger.';
  } else {
    recomendacao = 'nenhum';
    frase = 'Não achei nem plano de hospedagem nem VPS ligada nesta conta da Hostinger.';
  }

  return { business, vps, recomendacao, frase };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [a, b] = process.argv.slice(2);
  if (!a || !b) {
    console.error('uso: detectar-destino.mjs <sites.json> <vms.json>');
    process.exit(2);
  }
  const r = decidirDestino({
    sites: JSON.parse(fs.readFileSync(a, 'utf8')),
    vms: JSON.parse(fs.readFileSync(b, 'utf8')),
  });
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.recomendacao === 'nenhum' ? 3 : 0);
}
