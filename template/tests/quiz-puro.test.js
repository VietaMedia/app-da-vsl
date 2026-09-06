import { test, expect } from 'vitest';
import { calcularPerfil, validarRespostas, perfilAtual } from '@/lib/quiz-puro';

const quiz = {
  questions: [
    { key: 'q1', text: 'P1', options: [
      { key: 'a', label: 'A', points: { foco: 2, calma: 0 } },
      { key: 'b', label: 'B', points: { foco: 0, calma: 2 } },
    ] },
    { key: 'q2', text: 'P2', options: [
      { key: 'a', label: 'A', points: { foco: 1, calma: 0 } },
      { key: 'b', label: 'B', points: { foco: 0, calma: 1 } },
    ] },
  ],
  profiles: [
    { key: 'foco', title: 'Foco', description: 'd', ajustes: 'a' },
    { key: 'calma', title: 'Calma', description: 'd', ajustes: 'a' },
  ],
};

test('calcularPerfil soma os pontos das respostas e devolve o perfil vencedor', () => {
  const r = calcularPerfil(quiz, { q1: 'a', q2: 'a' });
  expect(r).toEqual({ perfilKey: 'foco', pontos: { foco: 3, calma: 0 } });
});

test('calcularPerfil: outro conjunto de respostas favorece outro perfil', () => {
  const r = calcularPerfil(quiz, { q1: 'b', q2: 'b' });
  expect(r).toEqual({ perfilKey: 'calma', pontos: { foco: 0, calma: 3 } });
});

test('calcularPerfil: empate escolhe o primeiro perfil na ordem de profiles', () => {
  const r = calcularPerfil(quiz, { q1: 'a', q2: 'b' });
  expect(r.pontos).toEqual({ foco: 2, calma: 1 });
  expect(r.perfilKey).toBe('foco');
});

test('calcularPerfil ignora respostas com optKey inexistente', () => {
  const r = calcularPerfil(quiz, { q1: 'x', q2: 'a' });
  expect(r).toEqual({ perfilKey: 'foco', pontos: { foco: 1, calma: 0 } });
});

test('validarRespostas: true quando toda pergunta tem uma opção válida', () => {
  expect(validarRespostas(quiz, { q1: 'a', q2: 'b' })).toBe(true);
});

test('validarRespostas: false quando falta pergunta', () => {
  expect(validarRespostas(quiz, { q1: 'a' })).toBe(false);
});

test('validarRespostas: false quando optKey não existe na pergunta', () => {
  expect(validarRespostas(quiz, { q1: 'a', q2: 'z' })).toBe(false);
});

test('validarRespostas: false quando respostas é null/undefined', () => {
  expect(validarRespostas(quiz, null)).toBe(false);
  expect(validarRespostas(quiz, undefined)).toBe(false);
});

const contentComQuiz = {
  modules: [
    { key: 'quiz-1', type: 'quiz', content: quiz },
  ],
};

test('perfilAtual: null quando perfil não tem answers.perfil', () => {
  expect(perfilAtual(contentComQuiz, { answers: {} })).toBeNull();
});

test('perfilAtual: null quando não existe módulo quiz no content', () => {
  expect(perfilAtual({ modules: [] }, { answers: { perfil: 'foco' } })).toBeNull();
});

test('perfilAtual: null quando a perfilKey não corresponde a nenhum perfil do quiz', () => {
  expect(perfilAtual(contentComQuiz, { answers: { perfil: 'fantasma' } })).toBeNull();
});

test('perfilAtual: devolve o quiz e o perfil quando a perfilKey é válida', () => {
  const r = perfilAtual(contentComQuiz, { answers: { perfil: 'calma' } });
  expect(r.quizKey).toBe('quiz-1');
  expect(r.profile.title).toBe('Calma');
});
