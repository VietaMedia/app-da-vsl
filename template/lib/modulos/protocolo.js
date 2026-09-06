import { addDias, diasEntre } from '../dates';
export function computeStreak(dates, hoje) {
  const set = new Set(dates);
  let cursor = set.has(hoje) ? hoje : addDias(hoje, -1);
  let n = 0;
  while (set.has(cursor)) { n++; cursor = addDias(cursor, -1); }
  return n;
}
export function diaAtual(primeiro, hoje, total) {
  if (!primeiro) return 1;
  return Math.min(total, Math.max(1, diasEntre(primeiro, hoje) + 1));
}
// Preferimos o startDate do perfil (definido na avaliação) para calcular o dia
// atual; sem ele, caímos na regra baseada no primeiro check-in.
export function diaAtualComInicio(startDate, primeiroCheckin, hoje, total) {
  if (startDate) return Math.min(total, Math.max(1, diasEntre(startDate, hoje) + 1));
  return diaAtual(primeiroCheckin, hoje, total);
}
export function validarItem(mod, day, taskIndex) {
  const days = mod.content.days;
  if (!Number.isInteger(day) || day < 1 || day > days.length) return { ok: false, erro: 'dia inválido' };
  const tasks = days[day - 1].tasks;
  if (!Number.isInteger(taskIndex) || taskIndex < 0 || taskIndex >= tasks.length) return { ok: false, erro: 'tarefa inválida' };
  return { ok: true };
}

// Pura: em que semana (1-indexada, blocos de 7 dias) cai um dia do protocolo.
export function semanaDoDia(day) {
  return Math.ceil(day / 7);
}

// Pura: um dia está feito quando todas as suas tarefas (d{day}-t{i}) têm
// check-in registrado, não importa a data em que foram marcadas.
export function diaFeito(day, checkins, tasks) {
  const marcados = new Set((checkins || []).map(c => c.itemKey));
  return (tasks || []).every((_, i) => marcados.has(`d${day}-t${i}`));
}

// Pura: só o dia atual e os anteriores podem receber check-in — um dia
// futuro abre só pra leitura. Usada tanto no cliente (Checkbox desabilitado)
// quanto no servidor (POST /api/modulos/protocolo/checkin), como fonte única
// da regra.
export function podeMarcarDia(day, diaAtualNum) {
  return day <= diaAtualNum;
}
