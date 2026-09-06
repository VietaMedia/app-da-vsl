import { validarData } from '@/lib/dates';
import { validarRespostas, calcularPerfil } from '@/lib/quiz-puro';

const CHAVE_RESPOSTA = /^[a-z0-9:-]{1,40}$/;
const MAX_RESPOSTAS = 30;

// Pura: valida o corpo de PUT /api/perfil. Devolve { dados } ou { erro }.
export function validarCorpo(body, hoje) {
  const dados = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { erro: 'corpo inválido' };

  if (body.name !== undefined) {
    const nome = String(body.name).trim();
    if (nome.length < 2 || nome.length > 40) return { erro: 'o nome precisa ter entre 2 e 40 letras' };
    dados.name = nome;
  }
  if (body.goal !== undefined) {
    if (typeof body.goal !== 'number' || !Number.isFinite(body.goal)) return { erro: 'a meta precisa ser um número' };
    dados.goal = body.goal;
  }
  if (body.startDate !== undefined) {
    if (!validarData(body.startDate, hoje)) return { erro: 'data de início inválida' };
    dados.startDate = body.startDate;
  }
  if (body.onboardingDone !== undefined) {
    if (typeof body.onboardingDone !== 'boolean') return { erro: 'onboardingDone precisa ser verdadeiro ou falso' };
    dados.onboardingDone = body.onboardingDone;
  }
  if (body.answers !== undefined) {
    if (typeof body.answers !== 'object' || body.answers === null || Array.isArray(body.answers)) {
      return { erro: 'respostas inválidas' };
    }
    const entradas = Object.entries(body.answers);
    if (entradas.length > MAX_RESPOSTAS) return { erro: 'respostas inválidas' };
    for (const [k, v] of entradas) {
      if (!CHAVE_RESPOSTA.test(k)) return { erro: 'respostas inválidas' };
      const valorValido = (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.length > 0 && v.length <= 40);
      if (!valorValido) return { erro: 'respostas inválidas' };
    }
    dados.answers = body.answers;
  }
  return { dados };
}

// Pura: extrai as respostas do quiz de dentro de `answers` (chaves "quiz:<qKey>",
// sem o prefixo).
function respostasQuizDeAnswers(answers) {
  const respostas = {};
  for (const [k, v] of Object.entries(answers || {})) {
    if (k.startsWith('quiz:')) respostas[k.slice('quiz:'.length)] = v;
  }
  return respostas;
}

// Pura: se `answers` tem respostas de quiz (chaves "quiz:<qKey>") e existe um
// módulo quiz, valida essas respostas e RECALCULA `answers.perfil` no
// servidor — o valor que o cliente mandou é só um palpite, nunca confiável
// (o cliente pode mandar qualquer perfilKey sem ter respondido nada).
// Devolve { answers } (com perfil recalculado, se aplicável) ou { erro }.
export function aplicarQuiz(answers, quizModule) {
  const respostas = respostasQuizDeAnswers(answers);
  if (Object.keys(respostas).length === 0) return { answers };
  if (!quizModule) return { answers };
  if (!validarRespostas(quizModule.content, respostas)) return { erro: 'respostas do quiz inválidas' };
  const { perfilKey } = calcularPerfil(quizModule.content, respostas);
  return { answers: { ...answers, perfil: perfilKey } };
}
