// Testa o módulo `quiz` (bloco de personalização por alternativas, §9 do PADRAO)
// contra o schema do template: (1) um config sem nenhum módulo quiz continua
// válido — o quiz é opcional ("quiz-free"); (2) um módulo quiz com referência de
// pontos que não bate com nenhum perfil é rejeitado.
//
// Depende do repositório do template (lib/schemas.js) estar presente na máquina.
// Aponte APP_DA_VSL_TEMPLATE_DIR se o caminho padrão não servir; sem o template
// os testes ficam "skipped" em vez de falhar (a skill não pode alterar o template,
// só consumi-lo).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CAMINHO_PADRAO = '/Users/guilhermevieta/Mega Brain/Mega Brain/projetos/App da VSL/template';
const templateDir = process.env.APP_DA_VSL_TEMPLATE_DIR || CAMINHO_PADRAO;
const schemasPath = path.join(templateDir, 'lib', 'schemas.js');
const disponivel = fs.existsSync(schemasPath);

function configBase(modules) {
  return {
    app: { name: 'App de Teste', shortName: 'Teste', slogan: 'slogan', description: 'descrição' },
    theme: { primary: '#2F6B3A', accent: '#E07A2F' },
    identity: {
      mood: 'natural',
      fonts: { display: 'Cormorant Garamond', body: 'Nunito Sans' },
      icon: { symbol: 'leaf' },
      illustration: 'leaf',
    },
    modules,
  };
}

test('quiz é opcional: config sem módulo quiz valida (quiz-free)', { skip: !disponivel && 'template não encontrado nesta máquina' }, async () => {
  const { configSchema } = await import(pathToFileURL(schemasPath).href);
  const cfg = configBase([
    { key: 'protocolo', type: 'protocolo', title: 'Protocolo', content: { days: [{ day: 1, title: 'Dia 1', tasks: ['tarefa 1'] }] } },
  ]);
  const r = configSchema.safeParse(cfg);
  assert.ok(r.success, r.success ? '' : JSON.stringify(r.error?.issues));
});

test('quiz com referência de pontos inválida é rejeitado', { skip: !disponivel && 'template não encontrado nesta máquina' }, async () => {
  const { moduleSchemas } = await import(pathToFileURL(schemasPath).href);
  const quiz = {
    questions: [{
      key: 'q1', text: 'Pergunta?',
      options: [{ key: 'a', label: 'Opção A', points: { 'perfil-que-nao-existe': 1 } }],
    }],
    profiles: [{ key: 'perfil-real', title: 'Perfil', description: 'desc', ajustes: 'md' }],
  };
  const r = moduleSchemas.quiz.safeParse(quiz);
  assert.equal(r.success, false, 'esperava rejeição por referência de perfil inexistente');
});

test('quiz válido (pontos referenciando perfis existentes) passa', { skip: !disponivel && 'template não encontrado nesta máquina' }, async () => {
  const { moduleSchemas } = await import(pathToFileURL(schemasPath).href);
  const quiz = {
    questions: [{
      key: 'q1', text: 'Pergunta?',
      options: [{ key: 'a', label: 'Opção A', points: { iniciante: 1 } }],
    }],
    profiles: [{ key: 'iniciante', title: 'Iniciante', description: 'desc', ajustes: 'md' }],
  };
  const r = moduleSchemas.quiz.safeParse(quiz);
  assert.ok(r.success, r.success ? '' : JSON.stringify(r.error?.issues));
});
