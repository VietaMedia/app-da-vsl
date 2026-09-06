import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { resumoGuias } from '@/lib/dados/guias';
import Cabecalho from '@/components/ui/Cabecalho';
import Cascata from '@/components/ui/Cascata';
import Card from '@/components/ui/Card';
import ListaGuias from '@/components/kit/ListaGuias';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function KitPage() {
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const mod = content.modules.find(m => m.type === 'guias');
  const modBiblioteca = content.modules.find(m => m.type === 'biblioteca');
  if (!mod && !modBiblioteca) notFound();
  const locale = content.app?.locale || 'pt';

  if (mod) {
    const guias = await resumoGuias(session.id, mod);
    return (
      <Cascata className="flex flex-col gap-[14px]">
        <Cabecalho titulo={mod.title} subtitulo={mod.subtitle} ilustracao={content.identity?.illustration} />
        <div style={{ padding: '0 18px' }}>
          <ListaGuias guias={guias} locale={locale} />
        </div>
      </Cascata>
    );
  }

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <Cabecalho titulo={modBiblioteca.title} subtitulo={modBiblioteca.subtitle} ilustracao={content.identity?.illustration} />
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {modBiblioteca.content.items.map((item, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800 }}>{item.title}</div>
                {item.description && <div style={{ fontSize: 13, color: 'var(--cor-texto-suave)', marginTop: 4 }}>{item.description}</div>}
              </div>
              <a href={item.url} target="_blank" rel="noopener" style={{ flexShrink: 0, fontWeight: 800, color: 'var(--cor-primaria)' }}>{t(locale, 'kit.abrir')}</a>
            </div>
          </Card>
        ))}
      </div>
    </Cascata>
  );
}
