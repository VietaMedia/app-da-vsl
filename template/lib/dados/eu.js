import { prisma } from '@/lib/db/prisma';
import { hojeISO, localeIntl } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { estadoProtocolo, diasComCheckin } from './protocolo';
import { estadoMetrica } from './metrica';
import { progressoTrilha } from './aulas';
import { notasRecentes } from './diario';
import { fasesDoProtocolo } from '@/lib/modulos/fases';
import { conquistas } from '@/lib/conquistas';

// Pura: "desde 5 de setembro" (ou equivalente no locale) a partir de um
// startDate ISO (ou null quando o perfil ainda não tem data de início).
export function desdeFormatado(startDate, locale = 'pt') {
  if (!startDate) return null;
  const d = new Date(startDate + 'T00:00:00');
  const formatado = new Intl.DateTimeFormat(localeIntl(locale), { day: 'numeric', month: 'long' }).format(d);
  return t(locale, 'eu.desde', { data: formatado });
}

// Compõe tudo que a tela Eu precisa: progresso do protocolo, métrica com
// meta, conquistas, notas do diário e lembretes de hoje. `perfil` pode trazer
// um `role` opcional (o chamador mescla o do session) pra decidir `ehDono`.
// As consultas independentes (protocolo, trilha, métrica, lembretes, diário)
// rodam em paralelo via Promise.all.
export async function resumoEu(userId, content, perfil) {
  const modules = content?.modules || [];
  const locale = content?.app?.locale || 'pt';
  const modProtocolo = modules.find(m => m.type === 'protocolo');
  const modTrilha = modules.find(m => m.type === 'trilha');
  const modRastreador = modules.find(m => m.type === 'rastreador');
  const modLembretes = modules.find(m => m.type === 'lembretes');

  const [estadoProto, diasFeitos, trilha, metricaEstado, lembretesRows, notas] = await Promise.all([
    modProtocolo ? estadoProtocolo(userId, modProtocolo, perfil?.startDate || null) : Promise.resolve(null),
    modProtocolo ? diasComCheckin(userId, modProtocolo.key) : Promise.resolve(0),
    modTrilha ? progressoTrilha(userId, modTrilha) : Promise.resolve(null),
    modRastreador ? estadoMetrica(userId, modRastreador, modRastreador.content.goal) : Promise.resolve(null),
    modLembretes ? prisma.checkin.findMany({ where: { userId, moduleKey: modLembretes.key, date: hojeISO() } }) : Promise.resolve(null),
    notasRecentes(userId, 14),
  ]);

  // `diaAtual` (o dia do programa) só existe quando há módulo protocolo —
  // null nos outros casos, como o cartão de compartilhar precisa saber.
  const diaAtual = modProtocolo ? estadoProto.diaAtual : null;
  const streak = modProtocolo ? estadoProto.streak : 0;
  const totalDias = modProtocolo ? estadoProto.totalDias : 0;

  let fimFase1 = 0;
  if (modProtocolo) {
    const fases = fasesDoProtocolo(modProtocolo.content.days);
    fimFase1 = fases.length > 1 ? fases[0].to : Math.min(9, totalDias);
  }

  const aulasFeitas = modTrilha ? trilha.feitas : 0;
  const totalAulas = modTrilha ? trilha.total : 0;

  const metrica = modRastreador
    ? {
        moduleKey: modRastreador.key,
        label: modRastreador.content.metric.label,
        unit: modRastreador.content.metric.unit,
        min: modRastreador.content.metric.min,
        max: modRastreador.content.metric.max,
        step: modRastreador.content.metric.step,
        ...metricaEstado,
      }
    : null;

  const lembretes = modLembretes
    ? {
        moduleKey: modLembretes.key,
        items: modLembretes.content.items,
        feitosHoje: lembretesRows.map(r => r.itemKey),
      }
    : null;

  return {
    nome: perfil?.name || null,
    desde: desdeFormatado(perfil?.startDate || null, locale),
    diaAtual,
    diasFeitos,
    streak,
    semanas: diaAtual ? Math.ceil(diaAtual / 7) : 0,
    totalDias,
    metrica,
    conquistas: conquistas({ diasFeitos, streak, totalDias, aulasFeitas, totalAulas, fimFase1 }, locale),
    notas,
    lembretes,
    ehDono: perfil?.role === 'owner',
  };
}
