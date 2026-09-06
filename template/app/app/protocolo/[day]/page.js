import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { getPerfil } from '@/lib/dados/perfil';
import { estadoProtocolo } from '@/lib/dados/protocolo';
import { temaDaSemana } from '@/lib/hoje-puro';
import Cascata from '@/components/ui/Cascata';
import Cabecalho from '@/components/ui/Cabecalho';
import Icone from '@/components/ui/Icone';
import Botao from '@/components/ui/Botao';
import DiaAberto from '@/components/protocolo/DiaAberto';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function DiaProtocoloPage({ params }) {
  const { day: dayParam } = await params;
  const day = Number(dayParam);

  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const mod = content.modules.find(m => m.type === 'protocolo');
  if (!mod) notFound();
  const dias = mod.content.days;
  const diaConteudo = Number.isInteger(day) ? dias.find(d => d.day === day) : null;
  if (!diaConteudo) notFound();

  const perfil = await getPerfil(session.id);
  const estado = await estadoProtocolo(session.id, mod, perfil?.startDate || null);
  const locale = content.app?.locale || 'pt';

  const fase = estado.fases.find(f => day >= f.from && day <= f.to);
  const titulo = temaDaSemana(diaConteudo.title);
  const marcados = new Set(estado.checkins.map(c => c.itemKey));
  const checadosIniciais = diaConteudo.tasks.map((_, i) => i).filter(i => marcados.has(`d${day}-t${i}`));

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <Cabecalho
        voltarHref="/app/protocolo"
        rotulo={`${t(locale, 'protocolo.diaN', { n: day })}${fase ? ` · ${fase.title}` : ''}`}
        titulo={titulo}
        tamanhoTitulo={28}
      />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {diaConteudo.tip && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18,
              background: 'linear-gradient(135deg, var(--cor-suave), var(--cor-fundo))', border: '1px solid var(--cor-linha)',
            }}
          >
            <Icone nome="spark" tamanho={22} cor="var(--cor-destaque)" />
            <div style={{ fontSize: 13, color: 'var(--cor-texto)', flex: 1 }}>{diaConteudo.tip}</div>
          </div>
        )}
        <DiaAberto moduleKey={mod.key} day={day} diaAtual={estado.diaAtual} tasks={diaConteudo.tasks} checadosIniciais={checadosIniciais} locale={locale} />
        {(day > 1 || day < dias.length) && (
          <div style={{ display: 'flex', gap: 10 }}>
            {day > 1 && <div style={{ flex: 1 }}><Botao variante="secundario" href={`/app/protocolo/${day - 1}`}>{t(locale, 'protocolo.diaAnterior')}</Botao></div>}
            {day < dias.length && <div style={{ flex: 1 }}><Botao variante="secundario" href={`/app/protocolo/${day + 1}`}>{t(locale, 'protocolo.proximoDia')}</Botao></div>}
          </div>
        )}
      </div>
    </Cascata>
  );
}
