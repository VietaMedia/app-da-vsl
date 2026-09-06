import { prisma } from '@/lib/db/prisma';
import { hojeISO } from '@/lib/dates';
import { computeStreak, diaAtualComInicio } from '@/lib/modulos/protocolo';
import { fasesDoProtocolo } from '@/lib/modulos/fases';
import { temaDaSemana } from '@/lib/hoje-puro';

// Estado do protocolo pra tela Hoje: dia atual (preferindo o startDate do
// perfil), sequência, fases, tema da semana e as tarefas do dia com o que já
// foi marcado hoje.
export async function estadoProtocolo(userId, mod, startDate = null) {
  const moduleKey = mod.key;
  const days = mod.content.days;
  const rows = await prisma.checkin.findMany({ where: { userId, moduleKey }, orderBy: { date: 'asc' } });
  const dates = [...new Set(rows.map(r => r.date))];
  const hoje = hojeISO();
  const totalDias = days.length;
  const diaAtualNum = diaAtualComInicio(startDate, dates[0] || null, hoje, totalDias);
  const streak = computeStreak(dates, hoje);
  const fases = fasesDoProtocolo(days);
  const faseAtual = fases.find(f => diaAtualNum >= f.from && diaAtualNum <= f.to) || fases[0] || null;
  const diaConteudo = days.find(d => d.day === diaAtualNum) || days[0];
  const temaSemana = temaDaSemana(diaConteudo?.title);
  const checadosHoje = new Set(rows.filter(r => r.date === hoje).map(r => r.itemKey));
  const tarefasHoje = (diaConteudo?.tasks || []).map((texto, index) => ({
    index,
    texto,
    feita: checadosHoje.has(`d${diaAtualNum}-t${index}`),
  }));
  const feitasHoje = tarefasHoje.filter(t => t.feita).length;
  return {
    diaAtual: diaAtualNum,
    streak,
    checkins: rows.map(r => ({ itemKey: r.itemKey, date: r.date })),
    fases,
    faseAtual,
    temaSemana,
    tarefasHoje,
    feitasHoje,
    totalHoje: tarefasHoje.length,
    totalDias,
  };
}

// Quantos dias do protocolo (não datas do calendário) já receberam pelo menos
// um check-in — usada na tela Eu pra "dias feitos" e como entrada de
// `conquistas()`. itemKey tem o formato `d{day}-t{taskIndex}`.
export async function diasComCheckin(userId, moduleKey) {
  const rows = await prisma.checkin.findMany({ where: { userId, moduleKey }, select: { itemKey: true } });
  const dias = new Set();
  for (const r of rows) {
    const m = /^d(\d+)-t\d+$/.exec(r.itemKey);
    if (m) dias.add(Number(m[1]));
  }
  return dias.size;
}
