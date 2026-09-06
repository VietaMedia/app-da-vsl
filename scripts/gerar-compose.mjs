#!/usr/bin/env node
// Gera o docker-compose de UM app pra VPS, mais a string `environment`
// que vai no mesmo VPS_createNewProjectV1. Funcao pura: nao fala com a rede.
//
// A imagem NAO vem de registro nenhum: ela e construida na propria VPS, a partir
// do repositorio privado do app no GitHub, usando o token que o mentorado ja tem
// (`gh auth token`). O token nunca aparece no YAML - ele entra pela variavel
// REPO_URL, que o Docker Compose interpola dentro do comando `docker build` do
// projeto de build separado (o Docker Manager da Hostinger so faz pull+up, nunca
// build - por isso o compose do app so referencia a imagem local, sem `build:`).
// Identificadores SQL vao SEM crase: dentro de `sh -c "..."` a crase vira substituicao de comando
// (achado no teste local de 2026-09-06). O slug validado garante que o nome nao precisa de aspas.
import fs from 'node:fs';

const OBRIGATORIAS = [
  'slug', 'repo', 'commit', 'ghToken', 'host', 'dbSenha', 'mysqlRootPassword',
  'sessionSecret', 'ownerEmail', 'ownerPin', 'accessToken',
];

export function slugValido(s) {
  return typeof s === 'string' && /^[a-z0-9][a-z0-9_-]{1,38}[a-z0-9]$/.test(s);
}

export function enderecoSslip(slug, ip) {
  return `${slug}.${String(ip).split('.').join('-')}.sslip.io`;
}

export function gerarCompose(o) {
  for (const c of OBRIGATORIAS) {
    if (o[c] === undefined || o[c] === null || o[c] === '') throw new Error(`falta a opcao ${c}`);
  }
  if (!slugValido(o.slug)) throw new Error(`slug invalido: ${o.slug} (use minusculas, numeros, - e _)`);
  if (!/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(o.repo)) {
    throw new Error(`repo invalido: ${o.repo} (use o formato dono/repositorio)`);
  }
  if (!/^[0-9a-f]{40}$/.test(o.commit)) {
    throw new Error(`commit invalido: ${o.commit} (use o sha completo de 40 caracteres, de git rev-parse HEAD)`);
  }

  const banco = o.slug.replace(/-/g, '_');
  const projeto = `app-${o.slug}`;
  const projetoBuild = `build-${o.slug}`;
  const https = o.https !== false;
  const rotulo = https ? o.host : `http://${o.host}`;
  const databaseUrl = `mysql://${banco}:${o.dbSenha}@mysql:3306/${banco}?connection_limit=5`;
  const commit7 = o.commit.slice(0, 7);
  const repoUrl = `https://x-access-token:${o.ghToken}@github.com/${o.repo}.git#${o.commit}`;

  const composeBuild = `# Gerado por gerar-compose.mjs. Projeto de build: constroi a imagem do app na propria VPS
# a partir do repositorio privado (REPO_URL vem do environment do projeto) e sai.
services:
  build:
    image: docker:27-cli
    restart: "no"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      DOCKER_BUILDKIT: "1"
    command: ["docker", "build", "--progress=plain", "-t", "app-${o.slug}:${commit7}", "\${REPO_URL}"]
`;

  const compose = `# Gerado por gerar-compose.mjs. Nao edite na mao: gere de novo.
# A rede "borda_default" e a rede padrao do projeto compose "borda" (Caddy + MySQL).
services:
  criar-banco:
    image: mysql:8.0
    restart: "no"
    networks:
      - borda_default
    command: >
      sh -c "until mysqladmin ping -h mysql -uroot -p$$MYSQL_ROOT_PASSWORD --silent; do sleep 2; done;
      mysql -h mysql -uroot -p$$MYSQL_ROOT_PASSWORD -e
      \\"CREATE DATABASE IF NOT EXISTS ${banco} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      CREATE USER IF NOT EXISTS '${banco}'@'%' IDENTIFIED BY '$$DB_SENHA';
      ALTER USER '${banco}'@'%' IDENTIFIED BY '$$DB_SENHA';
      GRANT ALL PRIVILEGES ON ${banco}.* TO '${banco}'@'%';
      FLUSH PRIVILEGES;\\""
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      DB_SENHA: \${DB_SENHA}

  app:
    image: app-${o.slug}:${commit7}
    pull_policy: never
    restart: unless-stopped
    depends_on:
      criar-banco:
        condition: service_completed_successfully
    networks:
      - borda_default
    environment:
      DATABASE_URL: \${DATABASE_URL}
      SESSION_SECRET: \${SESSION_SECRET}
      OWNER_EMAIL: \${OWNER_EMAIL}
      OWNER_PIN: \${OWNER_PIN}
      ACCESS_TOKEN: \${ACCESS_TOKEN}
    labels:
      caddy: ${rotulo}
      caddy.reverse_proxy: "{{upstreams 3000}}"

networks:
  borda_default:
    external: true
`;

  const environment = [
    `DATABASE_URL=${databaseUrl}`,
    `DB_SENHA=${o.dbSenha}`,
    `MYSQL_ROOT_PASSWORD=${o.mysqlRootPassword}`,
    `SESSION_SECRET=${o.sessionSecret}`,
    `OWNER_EMAIL=${o.ownerEmail}`,
    `OWNER_PIN=${o.ownerPin}`,
    `ACCESS_TOKEN=${o.accessToken}`,
    `REPO_URL=${repoUrl}`,
  ].join('\n') + '\n';

  return {
    projeto, compose, environment, databaseUrl, host: o.host,
    imagem: `app-${o.slug}:${commit7}`, projetoBuild, composeBuild,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arq = process.argv[2];
  if (!arq) { console.error('uso: gerar-compose.mjs <opcoes.json>'); process.exit(2); }
  const r = gerarCompose(JSON.parse(fs.readFileSync(arq, 'utf8')));
  console.log(JSON.stringify(r, null, 2));
}
