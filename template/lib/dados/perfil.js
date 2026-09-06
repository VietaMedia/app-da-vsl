import { prisma, ensureSchema } from '@/lib/db/prisma';

// Pura: não depende de banco. Acha os módulos (calculadora e/ou quiz) que disparam
// a avaliação guiada no primeiro acesso (content.modules[].content.onboarding === true).
// Devolve undefined quando nenhum dos dois existe, ou { calculadora?, quiz? } caso
// contrário — a calculadora sempre vem primeiro na avaliação guiada, depois o quiz.
export function moduloDeOnboarding(content) {
  const modules = content?.modules || [];
  const calculadora = modules.find(m => m.type === 'calculadora' && m?.content?.onboarding);
  const quiz = modules.find(m => m.type === 'quiz' && m?.content?.onboarding);
  if (!calculadora && !quiz) return undefined;
  return { calculadora, quiz };
}

// Pura: não depende de banco. Um perfil está pronto quando não existe módulo
// de onboarding (calculadora e/ou quiz) no conteúdo, ou quando o onboarding já foi feito.
export function perfilPronto(perfil, content) {
  const precisaOnboarding = !!moduloDeOnboarding(content);
  if (!precisaOnboarding) return true;
  return !!perfil?.onboardingDone;
}

function parseAnswers(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function getPerfil(userId) {
  await ensureSchema();
  const row = await prisma.profile.findUnique({ where: { userId } });
  if (!row) return { userId, name: null, goal: null, startDate: null, onboardingDone: false, answers: {} };
  return { ...row, answers: parseAnswers(row.answers) };
}

export async function salvarPerfil(userId, dados = {}) {
  await ensureSchema();
  const { name, goal, startDate, onboardingDone, answers } = dados;
  const data = {};
  if (name !== undefined) data.name = name;
  if (goal !== undefined) data.goal = goal;
  if (startDate !== undefined) data.startDate = startDate;
  if (onboardingDone !== undefined) data.onboardingDone = onboardingDone;
  if (answers !== undefined) data.answers = JSON.stringify(answers);
  return prisma.profile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}
