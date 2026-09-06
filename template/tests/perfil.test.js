import { test, expect } from 'vitest';
import { perfilPronto, moduloDeOnboarding } from '@/lib/dados/perfil';

test('moduloDeOnboarding: undefined quando não há calculadora nem quiz de onboarding', () => {
  expect(moduloDeOnboarding({ modules: [{ type: 'rastreador', content: {} }] })).toBeUndefined();
});

test('moduloDeOnboarding: devolve só calculadora quando só ela tem onboarding', () => {
  const calc = { type: 'calculadora', content: { onboarding: true } };
  const r = moduloDeOnboarding({ modules: [calc] });
  expect(r.calculadora).toBe(calc);
  expect(r.quiz).toBeUndefined();
});

test('moduloDeOnboarding: devolve só quiz quando só ele tem onboarding', () => {
  const quiz = { type: 'quiz', content: { onboarding: true } };
  const r = moduloDeOnboarding({ modules: [quiz] });
  expect(r.quiz).toBe(quiz);
  expect(r.calculadora).toBeUndefined();
});

test('moduloDeOnboarding: devolve calculadora e quiz juntos quando ambos têm onboarding', () => {
  const calc = { type: 'calculadora', content: { onboarding: true } };
  const quiz = { type: 'quiz', content: { onboarding: true } };
  const r = moduloDeOnboarding({ modules: [calc, quiz] });
  expect(r.calculadora).toBe(calc);
  expect(r.quiz).toBe(quiz);
});

test('onboarding pendente: módulo calculadora com onboarding e perfil não terminou', () => {
  const content = { modules: [{ type: 'calculadora', content: { onboarding: true } }] };
  expect(perfilPronto({ onboardingDone: false }, content)).toBe(false);
});

test('sem módulo de onboarding: perfil considerado pronto', () => {
  const content = { modules: [{ type: 'rastreador', content: {} }] };
  expect(perfilPronto({ onboardingDone: false }, content)).toBe(true);
});

test('com onboardingDone: perfil pronto mesmo havendo módulo de onboarding', () => {
  const content = { modules: [{ type: 'calculadora', content: { onboarding: true } }] };
  expect(perfilPronto({ onboardingDone: true }, content)).toBe(true);
});

test('onboarding pendente: só módulo quiz com onboarding e perfil não terminou', () => {
  const content = { modules: [{ type: 'quiz', content: { onboarding: true } }] };
  expect(perfilPronto({ onboardingDone: false }, content)).toBe(false);
});

test('onboarding pendente: calculadora e quiz juntos, ambos com onboarding', () => {
  const content = { modules: [
    { type: 'calculadora', content: { onboarding: true } },
    { type: 'quiz', content: { onboarding: true } },
  ] };
  expect(perfilPronto({ onboardingDone: false }, content)).toBe(false);
  expect(perfilPronto({ onboardingDone: true }, content)).toBe(true);
});

test('quiz sem onboarding=true não dispara onboarding', () => {
  const content = { modules: [{ type: 'quiz', content: { onboarding: false } }] };
  expect(perfilPronto({ onboardingDone: false }, content)).toBe(true);
});
