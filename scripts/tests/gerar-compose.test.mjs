import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gerarCompose, slugValido, enderecoSslip } from '../gerar-compose.mjs';
import { decidirDestino } from '../detectar-destino.mjs';

const COMMIT = '0123456789abcdef0123456789abcdef01234567';

const base = {
  slug: 'renda-smart',
  repo: 'VietaMedia/renda-smart-app',
  commit: COMMIT,
  ghToken: 'gho_tokenSecretoDoMentorado',
  host: 'renda.exemplo.com',
  dbSenha: 'abc123def456',
  mysqlRootPassword: 'root123',
  sessionSecret: 'a'.repeat(48),
  ownerEmail: 'dono@exemplo.com',
  ownerPin: '482913',
  accessToken: 'tok-longo',
  https: true,
};

test('nome do projeto e derivado do slug', () => {
  assert.equal(gerarCompose(base).projeto, 'app-renda-smart');
});

test('DATABASE_URL usa o host mysql e limita o pool', () => {
  const r = gerarCompose(base);
  assert.equal(r.databaseUrl, 'mysql://renda_smart:abc123def456@mysql:3306/renda_smart?connection_limit=5');
  assert.match(r.environment, /^DATABASE_URL=mysql:\/\/renda_smart:/m);
});

test('nome de banco troca traco por underscore', () => {
  assert.match(gerarCompose(base).compose, /renda_smart/);
  assert.doesNotMatch(gerarCompose(base).databaseUrl, /renda-smart/);
});

test('com https as labels do caddy usam o host puro', () => {
  const c = gerarCompose(base).compose;
  assert.match(c, /caddy: renda\.exemplo\.com/);
  assert.match(c, /caddy\.reverse_proxy: "\{\{upstreams 3000\}\}"/);
});

test('sem https as labels do caddy prefixam http:// pra nao tentar certificado', () => {
  const c = gerarCompose({ ...base, https: false, host: 'x.31-97-10-20.sslip.io' }).compose;
  assert.match(c, /caddy: http:\/\/x\.31-97-10-20\.sslip\.io/);
});

test('a rede borda_default entra como externa', () => {
  assert.match(gerarCompose(base).compose, /borda_default:\n\s+external: true/);
});

test('o servico de criar banco roda uma vez so', () => {
  const c = gerarCompose(base).compose;
  assert.match(c, /restart: "no"/);
  assert.match(c, /CREATE DATABASE IF NOT EXISTS/);
  // as crases vao escapadas: dentro do sh -c "..." uma crase crua viraria substituicao
  assert.ok(c.includes('GRANT ALL PRIVILEGES ON renda_smart.* TO'));
  assert.doesNotMatch(c, /`/); // crase dentro de sh -c vira substituição de comando
});

test('a imagem e construida na VPS a partir do repositorio, via REPO_URL', () => {
  const r = gerarCompose(base);
  assert.doesNotMatch(r.compose, /build:/);
  assert.match(r.compose, /image: app-renda-smart:0123456/);
  assert.match(r.compose, /pull_policy: never/);
  assert.doesNotMatch(r.compose, /^\s+image: ghcr\.io/m);
  const linhaRepo = r.environment.split('\n').find((l) => l.startsWith('REPO_URL='));
  assert.ok(linhaRepo, 'environment tem que trazer REPO_URL');
  assert.match(linhaRepo, /x-access-token:/);
  assert.match(linhaRepo, new RegExp(`#${COMMIT}$`));
});

test('o projeto de build separado constroi a imagem pelo socket do docker', () => {
  const r = gerarCompose(base);
  assert.equal(r.projetoBuild, 'build-renda-smart');
  assert.match(r.composeBuild, /\$\{REPO_URL\}/);
  assert.match(r.composeBuild, /docker\.sock/);
  assert.match(r.composeBuild, /-t", "app-renda-smart:0123456/);
});

test('nem o compose do app nem o do build vazam o ghToken', () => {
  const r = gerarCompose(base);
  assert.doesNotMatch(r.compose, /gho_tokenSecretoDoMentorado/);
  assert.doesNotMatch(r.composeBuild, /gho_tokenSecretoDoMentorado/);
});

test('environment traz todas as variaveis e nenhuma vazia', () => {
  const linhas = gerarCompose(base).environment.trim().split('\n');
  const chaves = linhas.map((l) => l.split('=')[0]).sort();
  assert.deepEqual(chaves, [
    'ACCESS_TOKEN', 'DATABASE_URL', 'DB_SENHA', 'MYSQL_ROOT_PASSWORD',
    'OWNER_EMAIL', 'OWNER_PIN', 'REPO_URL', 'SESSION_SECRET',
  ]);
  for (const l of linhas) assert.notEqual(l.split('=')[1], '');
});

test('o compose gerado nao vaza senha nem token', () => {
  const c = gerarCompose(base).compose;
  assert.doesNotMatch(c, /gho_tokenSecretoDoMentorado/);
  assert.doesNotMatch(c, /abc123def456/);
  assert.doesNotMatch(c, /root123/);
  assert.doesNotMatch(c, /x-access-token/);
});

test('slug invalido e recusado', () => {
  assert.equal(slugValido('renda-smart'), true);
  assert.equal(slugValido('Renda Smart'), false);
  assert.equal(slugValido('renda_smart'), true);
  assert.equal(slugValido('-x'), false);
  assert.throws(() => gerarCompose({ ...base, slug: 'Renda Smart' }), /slug/);
});

test('repo e commit malformados sao recusados', () => {
  assert.throws(() => gerarCompose({ ...base, repo: 'renda-smart-app' }), /repo/);
  assert.throws(() => gerarCompose({ ...base, commit: 'main' }), /commit/);
});

test('endereco sslip troca ponto por traco no ip', () => {
  assert.equal(enderecoSslip('renda-smart', '31.97.10.20'), 'renda-smart.31-97-10-20.sslip.io');
});

test('faltando uma opcao obrigatoria, estoura', () => {
  assert.throws(() => gerarCompose({ ...base, sessionSecret: undefined }), /sessionSecret/);
});

test('contrato: o ip que o detector devolve serve pro endereco sslip', () => {
  const d = decidirDestino({ sites: [], vms: [{ id: 1, hostname: 'v', state: 'running', ipv4: [{ address: '31.97.10.20' }] }] });
  const host = enderecoSslip('meu-app', d.vps.maquinas[0].ip);
  assert.equal(host, 'meu-app.31-97-10-20.sslip.io');
  const r = gerarCompose({ ...base, host, https: false });
  assert.match(r.compose, /caddy: http:\/\/meu-app\.31-97-10-20\.sslip\.io/);
});

test('o compose gerado nao vaza senha em texto no YAML', () => {
  const r = gerarCompose(base);
  assert.doesNotMatch(r.compose, /abc123def456/);
  assert.doesNotMatch(r.compose, /root123/);
  assert.doesNotMatch(r.compose, new RegExp('a'.repeat(48)));
  assert.doesNotMatch(r.compose, new RegExp(base.ghToken));
});

test('o compose referencia a mesma rede que o compose-borda declara', () => {
  const borda = fs.readFileSync(new URL('../compose-borda.yml', import.meta.url), 'utf8');
  assert.match(borda, /CADDY_INGRESS_NETWORKS: borda_default/);
  assert.doesNotMatch(borda, /external: true/);
  const c = gerarCompose(base).compose;
  assert.match(c, /borda_default:\n\s+external: true/);
});

test('o compose-borda expoe o servico chamado mysql, que e o host do DATABASE_URL', () => {
  const borda = fs.readFileSync(new URL('../compose-borda.yml', import.meta.url), 'utf8');
  assert.match(borda, /^\s{2}mysql:$/m);
  assert.match(gerarCompose(base).databaseUrl, /@mysql:3306\//);
});

test('o compose-borda nao publica a porta do mysql pro mundo', () => {
  const borda = fs.readFileSync(new URL('../compose-borda.yml', import.meta.url), 'utf8');
  assert.doesNotMatch(borda, /"3306:3306"/);
});
