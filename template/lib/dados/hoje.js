import { hojeISO, dataFormatadaPara } from '@/lib/dates';
import { CLIMAS } from '@/lib/identidade/climas';
import { saudacaoPara, temaDaSemana } from '@/lib/hoje-puro';
import { t } from '@/lib/i18n';
import { estadoProtocolo } from './protocolo';
import { estadoMetrica } from './metrica';
import { contadorHoje } from './contador';
import { progressoTrilha } from './aulas';

// Re-exportadas pra que os testes de puras nunca precisem importar Prisma.
export { saudacaoPara, temaDaSemana };

function horaAgora() {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
}

// Compõe tudo que a tela Hoje precisa: saudação, cabeçalho de data, o estado
// do protocolo/métrica/contador (quando o app tiver esses módulos) e a
// próxima aula (Task 8 liga isso via progressoTrilha; até lá fica null).
export async function resumoHoje(userId, content, perfil) {
  const modules = content?.modules || [];
  const mood = content?.identity?.mood;
  const locale = content?.app?.locale || 'pt';
  const tom = CLIMAS[mood]?.tomSaudacao || 'caloroso';
  const saudacao = saudacaoPara(horaAgora(), tom, locale);
  const nome = perfil?.name || '';
  const hoje = hojeISO();
  const dataFormatada = dataFormatadaPara(hoje, locale);

  const modProtocolo = modules.find(m => m.type === 'protocolo');
  const protocolo = modProtocolo ? await estadoProtocolo(userId, modProtocolo, perfil?.startDate || null) : null;

  const modRastreador = modules.find(m => m.type === 'rastreador');
  const metrica = modRastreador
    ? {
        label: modRastreador.content.metric.label,
        unit: modRastreador.content.metric.unit,
        ...(await estadoMetrica(userId, modRastreador, modRastreador.content.goal)),
      }
    : null;

  const modContador = modules.find(m => m.type === 'contador');
  const contador = modContador
    ? {
        moduleKey: modContador.key,
        label: modContador.content.label,
        unit: modContador.content.unit,
        step: modContador.content.step ?? 1,
        ...(await contadorHoje(userId, modContador)),
      }
    : null;

  const modTrilha = modules.find(m => m.type === 'trilha');
  let proximaAula = null;
  if (modTrilha) {
    const trilha = await progressoTrilha(userId, modTrilha);
    if (trilha.proximaAula) {
      const { sectionKey, stepKey, title, minutos } = trilha.proximaAula;
      const secao = modTrilha.content.sections.find(s => s.key === sectionKey);
      proximaAula = {
        titulo: title,
        href: `/app/aulas/${sectionKey}/${stepKey}`,
        meta: `${t(locale, 'hoje.minDeLeitura', { min: minutos })}${secao ? ` · ${secao.title}` : ''}`,
      };
    }
  }

  const tudoFeito = !!protocolo && protocolo.totalHoje > 0 && protocolo.feitasHoje === protocolo.totalHoje;

  return { saudacao, nome, dataFormatada, protocolo, metrica, contador, proximaAula, tudoFeito };
}
