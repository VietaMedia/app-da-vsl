import Link from 'next/link';
import Icone from '@/components/ui/Icone';
import { diaFeito } from '@/lib/modulos/protocolo';
import { temaDaSemana } from '@/lib/hoje-puro';
import { t } from '@/lib/i18n';

function LinhaDia({ dia, feito, diaAtual, locale = 'pt' }) {
  const hoje = dia.day === diaAtual;
  const bloqueado = dia.day > diaAtual;
  const meta = feito
    ? t(locale, 'protocolo.concluido')
    : hoje
      ? t(locale, 'protocolo.hojeNTarefas', { n: dia.tasks.length, s: dia.tasks.length === 1 ? '' : 's' })
      : dia.day === diaAtual + 1
        ? t(locale, 'protocolo.amanha')
        : t(locale, 'protocolo.emNDias', { n: dia.day - diaAtual });
  const bg = feito ? 'var(--cor-primaria)' : hoje ? 'var(--cor-destaque)' : 'var(--cor-superficie)';
  const cor = feito || hoje ? '#fff' : 'var(--cor-texto-suave)';

  return (
    <Link
      href={`/app/protocolo/${dia.day}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 16,
        textDecoration: 'none', color: 'inherit',
        background: hoje ? '#fff' : 'transparent',
        border: `1px solid ${hoje ? 'var(--cor-linha)' : 'transparent'}`,
        boxShadow: hoje ? 'var(--sombra)' : 'none',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: cor, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
        {feito ? <Icone nome="check" tamanho={18} cor="#fff" traco={2.6} /> : dia.day}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: feito ? 'var(--cor-texto-suave)' : 'var(--cor-texto)' }}>
          {temaDaSemana(dia.title)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--cor-texto-suave)' }}>{meta}</div>
      </div>
      {hoje && <Icone nome="chev" tamanho={18} cor="var(--cor-destaque)" traco={2.4} />}
      {bloqueado && !feito && <Icone nome="lock" tamanho={18} cor="#C9CFC4" />}
    </Link>
  );
}

// Lista dos dias de uma semana: cabeçalho com o tema da semana e o intervalo
// de dias, seguido de uma linha por dia (feito / hoje / bloqueado). Todo dia
// abre `/app/protocolo/[day]` — o bloqueado abre só pra leitura.
export default function ListaDias({ days, checkins, diaAtual, locale = 'pt' }) {
  if (!days.length) return null;
  const temas = new Set(days.map((d) => temaDaSemana(d.title)));
  const tema = temas.size === 1 ? temaDaSemana(days[0].title) : t(locale, 'protocolo.semanaN', { n: Math.ceil(days[0].day / 7) });
  const primeiro = days[0].day;
  const ultimo = days[days.length - 1].day;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ padding: '6px 8px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div className="display" style={{ fontSize: 20, fontWeight: 700 }}>{tema}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cor-texto-suave)', whiteSpace: 'nowrap' }}>{t(locale, 'protocolo.diasAaB', { a: primeiro, b: ultimo })}</div>
      </div>
      {days.map(dia => (
        <LinhaDia key={dia.day} dia={dia} feito={diaFeito(dia.day, checkins, dia.tasks)} diaAtual={diaAtual} locale={locale} />
      ))}
    </div>
  );
}
