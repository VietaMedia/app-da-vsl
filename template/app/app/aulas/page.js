import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { progressoTrilha } from '@/lib/dados/aulas';
import Cabecalho from '@/components/ui/Cabecalho';
import Cascata from '@/components/ui/Cascata';
import ListaSecoes from '@/components/aulas/ListaSecoes';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function AulasPage() {
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const mod = content.modules.find(m => m.type === 'trilha');
  if (!mod) notFound();

  const progresso = await progressoTrilha(session.id, mod);
  const locale = content.app?.locale || 'pt';

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <Cabecalho rotulo={mod.subtitle} titulo={mod.title} ilustracao={content.identity?.illustration}>
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>{t(locale, 'aulas.xDeYAulas', { x: progresso.feitas, y: progresso.total })}</div>
      </Cabecalho>
      <div style={{ padding: '0 18px' }}>
        <ListaSecoes secoes={progresso.porSecao} locale={locale} />
      </div>
    </Cascata>
  );
}
