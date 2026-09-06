import { t } from '@/lib/i18n';

// Pura: marcos de progresso pra tela Eu. `diasFeitos` é a contagem de dias
// distintos do protocolo com pelo menos um check-in (não precisa ser
// consecutivo); `fimFase1` é o último dia da primeira fase. `locale` traduz
// título e descrição ('pt'/'es'/'en'; cai pro pt quando desconhecido).
export function conquistas({ diasFeitos = 0, streak = 0, totalDias = 0, aulasFeitas = 0, totalAulas = 0, fimFase1 = 0 } = {}, locale = 'pt') {
  const metade = totalDias > 0 && diasFeitos >= totalDias / 2;
  const tt = chave => t(locale, `conquistas.${chave}.titulo`);
  const dd = chave => t(locale, `conquistas.${chave}.descricao`);
  return [
    {
      key: 'primeiro-dia',
      titulo: tt('primeiro-dia'),
      descricao: dd('primeiro-dia'),
      icone: 'spark',
      alcancada: diasFeitos >= 1,
    },
    {
      key: 'fase-1',
      titulo: tt('fase-1'),
      descricao: dd('fase-1'),
      icone: 'check',
      alcancada: fimFase1 > 0 && diasFeitos >= fimFase1,
    },
    {
      key: 'semana-cheia',
      titulo: tt('semana-cheia'),
      descricao: dd('semana-cheia'),
      icone: 'fire',
      alcancada: streak >= 7,
    },
    {
      key: 'um-mes',
      titulo: tt('um-mes'),
      descricao: dd('um-mes'),
      icone: 'calendar',
      alcancada: diasFeitos >= 28,
    },
    {
      key: 'metade',
      titulo: tt('metade'),
      descricao: dd('metade'),
      icone: 'trophy',
      alcancada: metade,
    },
    {
      key: 'dedicacao-total',
      titulo: tt('dedicacao-total'),
      descricao: dd('dedicacao-total'),
      icone: 'play',
      alcancada: totalAulas > 0 && aulasFeitas >= totalAulas,
    },
    {
      key: 'dia-final',
      titulo: tt('dia-final'),
      descricao: totalDias > 0
        ? t(locale, 'conquistas.dia-final.descricao', { total: totalDias })
        : t(locale, 'conquistas.dia-final.descricaoSemTotal'),
      icone: 'trophy',
      alcancada: totalDias > 0 && diasFeitos >= totalDias,
    },
  ];
}
