#!/usr/bin/env node
// validar-config.mjs — valida um app.config.json contra o schema do template.
// Generalizado a partir de apps/programa-active/scripts/validar-config.mjs:
// aceita o caminho do config e a pasta do template como argumentos, em vez de
// caminhos relativos fixos.
//
// uso: node validar-config.mjs <config.json> <templateDir>

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , configPath, templateDir] = process.argv;

if (!configPath || !templateDir) {
  console.error('uso: node validar-config.mjs <config.json> <templateDir>');
  process.exit(1);
}

if (!fs.existsSync(configPath)) {
  console.error(`config não encontrado: ${configPath}`);
  process.exit(1);
}

const schemasPath = path.join(templateDir, 'lib', 'schemas.js');
if (!fs.existsSync(schemasPath)) {
  console.error(`schemas.js não encontrado em: ${schemasPath}`);
  console.error('confira se templateDir aponta pra raiz do repositório template.');
  process.exit(1);
}

const { configSchema } = await import(pathToFileURL(schemasPath).href);

const dados = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const r = configSchema.safeParse(dados);

if (!r.success) {
  console.error('config inválido:');
  for (const issue of r.error.issues) {
    console.error(`  - ${issue.path.join('.') || '(raiz)'}: ${issue.message}`);
  }
  process.exit(1);
}

const c = r.data;
const protocolo = c.modules.find((m) => m.type === 'protocolo');
const trilha = c.modules.find((m) => m.type === 'trilha');
const guias = c.modules.find((m) => m.type === 'guias');
const dias = protocolo ? protocolo.content.days.length : 0;
const aulas = trilha ? trilha.content.sections.reduce((n, s) => n + s.steps.length, 0) : 0;
const nGuias = guias ? guias.content.guides.length : 0;

console.log(`config válido: ${c.modules.length} módulos, ${dias} dias, ${aulas} aulas, ${nGuias} guias`);
