import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decidirDestino } from '../detectar-destino.mjs';

const vmAtiva = { id: 918273, hostname: 'srv918273', state: 'running', ipv4: [{ address: '31.97.10.20' }] };
const vmParada = { id: 918274, hostname: 'srv918274', state: 'stopped', ipv4: [{ address: '31.97.10.21' }] };
const site = (dom) => ({ domain: dom, order_id: '1007691690', type: 'node' });

test('só Business: recomenda business', () => {
  const r = decidirDestino({ sites: [site('a.hostingersite.com')], vms: [] });
  assert.equal(r.recomendacao, 'business');
  assert.equal(r.business.disponivel, true);
  assert.equal(r.vps.disponivel, false);
});

test('só VPS ativa: recomenda vps e expõe id e ip', () => {
  const r = decidirDestino({ sites: [], vms: [vmAtiva] });
  assert.equal(r.recomendacao, 'vps');
  assert.deepEqual(r.vps.maquinas, [{ id: 918273, hostname: 'srv918273', ip: '31.97.10.20', estado: 'running' }]);
});

test('VPS parada não conta como disponível', () => {
  const r = decidirDestino({ sites: [], vms: [vmParada] });
  assert.equal(r.recomendacao, 'nenhum');
  assert.equal(r.vps.disponivel, false);
});

test('os dois: manda perguntar', () => {
  const r = decidirDestino({ sites: [site('a.hostingersite.com')], vms: [vmAtiva] });
  assert.equal(r.recomendacao, 'perguntar');
  assert.match(r.frase, /VPS/);
});

test('Business com 2 sites ou mais: recomenda vps mesmo tendo os dois', () => {
  const sites = [site('a.hostingersite.com'), site('b.hostingersite.com'), site('c.hostingersite.com')];
  const r = decidirDestino({ sites, vms: [vmAtiva] });
  assert.equal(r.recomendacao, 'vps');
  assert.match(r.business.motivo, /já tem 3/);
});

test('nada: recomendacao nenhum', () => {
  const r = decidirDestino({ sites: [], vms: [] });
  assert.equal(r.recomendacao, 'nenhum');
});

test('aceita resposta MCP embrulhada em {data:[...]}', () => {
  const r = decidirDestino({ sites: { data: [site('a.hostingersite.com')] }, vms: { data: [] } });
  assert.equal(r.recomendacao, 'business');
});

test('sites que não são node não contam', () => {
  const r = decidirDestino({ sites: [{ domain: 'wp.com', type: 'wordpress' }], vms: [] });
  assert.equal(r.business.quantidadeSites, 0);
});
