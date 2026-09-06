import { prisma } from '@/lib/db/prisma';
import { hojeISO } from '@/lib/dates';

// Estado de um módulo contador pra hoje: quanto já foi registrado e a meta.
export async function contadorHoje(userId, mod) {
  const moduleKey = mod.key;
  const row = await prisma.measurement.findUnique({
    where: { userId_moduleKey_date: { userId, moduleKey, date: hojeISO() } },
  });
  return { valor: row?.value ?? 0, goal: mod.content.goal };
}

// Aplica um delta (±step) ao contador de hoje, sem deixar passar de 0 nem de
// goal*2. É uma única instrução atômica no banco (INSERT ... ON DUPLICATE KEY
// UPDATE com LEAST/GREATEST) — evita "lost update" quando dois toques chegam
// quase juntos, o que um read-then-write não garante.
export async function ajustarContador(userId, mod, delta) {
  const moduleKey = mod.key;
  const hoje = hojeISO();
  const max = mod.content.goal * 2;
  await prisma.$executeRaw`INSERT INTO \`Measurement\` (userId, moduleKey, value, date) VALUES (${userId}, ${moduleKey}, LEAST(GREATEST(${delta}, 0), ${max}), ${hoje}) ON DUPLICATE KEY UPDATE value = LEAST(GREATEST(value + ${delta}, 0), ${max})`;
  const row = await prisma.measurement.findUnique({
    where: { userId_moduleKey_date: { userId, moduleKey, date: hoje } },
  });
  return { valor: row.value, goal: mod.content.goal };
}
