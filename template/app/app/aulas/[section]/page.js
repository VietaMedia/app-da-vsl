import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { progressoTrilha } from '@/lib/dados/aulas';
import Cabecalho from '@/components/ui/Cabecalho';
import Cascata from '@/components/ui/Cascata';
import ListaAulas from '@/components/aulas/ListaAulas';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function SecaoAulasPage({ params }) {
  const { section } = await params;
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const mod = content.modules.find(m => m.type === 'trilha');
  const idx = mod ? mod.content.sections.findIndex(s => s.key === section) : -1;
  if (!mod || idx === -1) notFound();
  const secao = mod.content.sections[idx];
  const locale = content.app?.locale || 'pt';

  const progresso = await progressoTrilha(session.id, mod);
  const infoSecao = progresso.porSecao.find(s => s.key === section);
  const pct = infoSecao.total ? Math.round((100 * infoSecao.feitas) / infoSecao.total) : 0;

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <Cabecalho
        voltarHref="/app/aulas"
        rotulo={t(locale, 'aulas.secaoKDeN', { k: idx + 1, n: mod.content.sections.length })}
        titulo={secao.title}
        tamanhoTitulo={34}
        ilustracao={content.identity?.illustration}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.2)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--cor-destaque)', borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{t(locale, 'aulas.xDeYAulas', { x: infoSecao.feitas, y: infoSecao.total })}</div>
        </div>
      </Cabecalho>
      <div style={{ padding: '0 20px' }}>
        <ListaAulas sectionKey={secao.key} steps={secao.steps} feitos={progresso.feitos} locale={locale} />
      </div>
    </Cascata>
  );
}
