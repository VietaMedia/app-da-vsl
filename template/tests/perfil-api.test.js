import { test, expect } from 'vitest';
import { validarCorpo, aplicarQuiz } from '@/lib/perfil-api';

const HOJE = '2026-09-05';

test('corpo vazio é válido (nenhum campo pra salvar)', () => {
  expect(validarCorpo({}, HOJE)).toEqual({ dados: {} });
});

test('corpo não-objeto é inválido', () => {
  expect(validarCorpo(null, HOJE).erro).toBe('corpo inválido');
  expect(validarCorpo('x', HOJE).erro).toBe('corpo inválido');
  expect(validarCorpo([], HOJE).erro).toBe('corpo inválido');
});

test('name precisa ter 2-40 letras', () => {
  expect(validarCorpo({ name: 'a' }, HOJE).erro).toBeTruthy();
  expect(validarCorpo({ name: 'Ana' }, HOJE).dados.name).toBe('Ana');
});

test('goal precisa ser número finito', () => {
  expect(validarCorpo({ goal: 'x' }, HOJE).erro).toBeTruthy();
  expect(validarCorpo({ goal: Infinity }, HOJE).erro).toBeTruthy();
  expect(validarCorpo({ goal: 7.5 }, HOJE).dados.goal).toBe(7.5);
});

test('startDate válido usando validarData (formato e não-futuro)', () => {
  expect(validarCorpo({ startDate: '2026-09-05' }, HOJE).dados.startDate).toBe('2026-09-05');
  expect(validarCorpo({ startDate: '2026-13-01' }, HOJE).erro).toBeTruthy();
  expect(validarCorpo({ startDate: '2099-01-01' }, HOJE).erro).toBeTruthy();
});

test('onboardingDone precisa ser booleano', () => {
  expect(validarCorpo({ onboardingDone: 'sim' }, HOJE).erro).toBeTruthy();
  expect(validarCorpo({ onboardingDone: true }, HOJE).dados.onboardingDone).toBe(true);
});

test('answers: chaves e valores válidos passam', () => {
  const r = validarCorpo({ answers: { acordar: 6, meta: 7.5 } }, HOJE);
  expect(r.dados.answers).toEqual({ acordar: 6, meta: 7.5 });
});

test('answers: valor string curto (não numérico) agora é válido — respostas de quiz usam string', () => {
  expect(validarCorpo({ answers: { acordar: 'x' } }, HOJE).erro).toBeUndefined();
});

test('answers: chave fora do padrão é inválida', () => {
  expect(validarCorpo({ answers: { 'Chave Ruim!': 1 } }, HOJE).erro).toBe('respostas inválidas');
});

test('answers: mais de 30 chaves é inválido', () => {
  const muitas = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`k${i}`, i]));
  expect(validarCorpo({ answers: muitas }, HOJE).erro).toBe('respostas inválidas');
});

test('answers: exatamente 30 chaves é válido', () => {
  const trinta = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, i]));
  expect(validarCorpo({ answers: trinta }, HOJE).erro).toBeUndefined();
});

test('answers: valor string com até 40 caracteres é válido (respostas de quiz e perfil)', () => {
  const r = validarCorpo({ answers: { 'quiz:q1': 'opcao-a', perfil: 'foco' } }, HOJE);
  expect(r.dados.answers).toEqual({ 'quiz:q1': 'opcao-a', perfil: 'foco' });
});

test('answers: valor string com mais de 40 caracteres é inválido', () => {
  const longa = 'a'.repeat(41);
  expect(validarCorpo({ answers: { perfil: longa } }, HOJE).erro).toBe('respostas inválidas');
});

test('answers: chave com dois-pontos (quiz:qKey) é aceita', () => {
  expect(validarCorpo({ answers: { 'quiz:pergunta-1': 'a' } }, HOJE).erro).toBeUndefined();
});

test('answers: valor que não é número nem string é inválido', () => {
  expect(validarCorpo({ answers: { x: true } }, HOJE).erro).toBe('respostas inválidas');
  expect(validarCorpo({ answers: { x: null } }, HOJE).erro).toBe('respostas inválidas');
});

const quizModule = {
  key: 'quiz-1',
  type: 'quiz',
  content: {
    questions: [
      { key: 'q1', text: 'P1', options: [
        { key: 'a', label: 'A', points: { foco: 2, calma: 0 } },
        { key: 'b', label: 'B', points: { foco: 0, calma: 2 } },
      ] },
    ],
    profiles: [
      { key: 'foco', title: 'Foco', description: 'd', ajustes: 'a' },
      { key: 'calma', title: 'Calma', description: 'd', ajustes: 'a' },
    ],
  },
};

test('aplicarQuiz: sem chaves quiz: nas answers, devolve as answers sem mudança', () => {
  expect(aplicarQuiz({ acordar: 6 }, quizModule)).toEqual({ answers: { acordar: 6 } });
});

test('aplicarQuiz: sem módulo quiz, devolve as answers sem mudança (mesmo com chaves quiz:)', () => {
  expect(aplicarQuiz({ 'quiz:q1': 'a' }, undefined)).toEqual({ answers: { 'quiz:q1': 'a' } });
});

test('aplicarQuiz: calcula e sobrescreve answers.perfil a partir das respostas do quiz', () => {
  const r = aplicarQuiz({ 'quiz:q1': 'a', perfil: 'palpite-do-cliente' }, quizModule);
  expect(r.answers.perfil).toBe('foco');
});

test('aplicarQuiz: ignora o perfil que o cliente mandou quando as respostas apontam pra outro', () => {
  const r = aplicarQuiz({ 'quiz:q1': 'b', perfil: 'foco' }, quizModule);
  expect(r.answers.perfil).toBe('calma');
});

test('aplicarQuiz: respostas incompletas (faltando pergunta) dão erro', () => {
  const r = aplicarQuiz({ perfil: 'foco', 'quiz:outra-pergunta': 'x' }, quizModule);
  expect(r.erro).toBe('respostas do quiz inválidas');
});

test('aplicarQuiz: optKey inexistente na pergunta dá erro', () => {
  const r = aplicarQuiz({ 'quiz:q1': 'opcao-fantasma' }, quizModule);
  expect(r.erro).toBe('respostas do quiz inválidas');
});
