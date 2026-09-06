import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { estadoGuia } from '@/lib/dados/guias';
import Icone from '@/components/ui/Icone';
import Cascata from '@/components/ui/Cascata';
import Card from '@/components/ui/Card';
import Botao from '@/components/ui/Botao';
import GuiaLista from '@/components/kit/GuiaLista';
import GuiaReceita from '@/components/kit/GuiaReceita';
import GuiaPassos from '@/components/kit/GuiaPassos';
import GuiaTexto from '@/components/kit/GuiaTexto';
import GuiaAudio from '@/components/kit/GuiaAudio';
import GuiaPagina from '@/components/kit/GuiaPagina';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

function Cabecalinho({ rotulo, titulo }) {
  return (
    <div style={{ padding: '60px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          href="/app/kit"
          style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1px solid var(--cor-linha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icone nome="back" tamanho={22} cor="var(--cor-texto)" traco={2.2} />
        </Link>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--cor-destaque)' }}>{rotulo}</div>
      </div>
      <div className="display" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.05, color: 'var(--cor-primaria-escura)' }}>{titulo}</div>
    </div>
  );
}

function Pill({ icone, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, background: '#fff', border: '1px solid var(--cor-linha)', fontSize: 13, fontWeight: 800 }}>
      <Icone nome={icone} tamanho={18} cor="var(--cor-primaria)" traco={1.9} />
      {children}
    </div>
  );
}

export default async function GuiaPage({ params }) {
  const { guide: guideKey } = await params;
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const mod = content.modules.find(m => m.type === 'guias');
  const guide = mod?.content.guides.find(g => g.key === guideKey);
  if (!mod || !guide) notFound();
  const locale = content.app?.locale || 'pt';

  if (guide.kind === 'lista') {
    const estado = await estadoGuia(session.id, mod, guide.key);
    const primeiraReceita = mod.content.guides.find(g => g.kind === 'receita');
    const primeiroPassos = mod.content.guides.find(g => g.kind === 'passos');
    return (
      <Cascata className="flex flex-col gap-[14px]">
        <Cabecalinho rotulo={mod.title} titulo={guide.title} />
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GuiaLista moduleKey={mod.key} guide={guide} marcadosIniciais={estado.marcados} locale={locale} />
          {(primeiraReceita || primeiroPassos) && (
            <div style={{ display: 'flex', gap: 10 }}>
              {primeiraReceita && (
                <Botao
                  variante="secundario" pequeno icone="bowl" href={`/app/kit/${primeiraReceita.key}`}
                  style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {t(locale, 'kit.receitas')}
                </Botao>
              )}
              {primeiroPassos && (
                <Botao
                  variante="quente" pequeno icone="clock" href={`/app/kit/${primeiroPassos.key}`}
                  style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {t(locale, 'kit.passoAPasso')}
                </Botao>
              )}
            </div>
          )}
        </div>
      </Cascata>
    );
  }

  if (guide.kind === 'receita') {
    const estado = await estadoGuia(session.id, mod, guide.key);
    return (
      <Cascata className="flex flex-col gap-[14px]">
        <Cabecalinho rotulo={mod.title} titulo={guide.title} />
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {guide.intro && <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)' }}>{guide.intro}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Pill icone="clock">{guide.time}</Pill>
            <Pill icone="bowl">{guide.servings}</Pill>
          </div>
          <GuiaReceita moduleKey={mod.key} guide={guide} marcadosIniciais={estado.marcados} locale={locale} />
          <Card>
            <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{t(locale, 'kit.modoDePreparo')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {guide.steps.map((passo, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: 'var(--cor-primaria)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 16, lineHeight: 1.5, paddingTop: 4 }}>{passo}</div>
                </div>
              ))}
            </div>
          </Card>
          {guide.tip && (
            <div style={{
              borderRadius: 'var(--raio)', padding: 20,
              background: 'rgba(var(--cor-destaque-rgb), .10)', border: '1px solid rgba(var(--cor-destaque-rgb), .3)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <Icone nome="spark" tamanho={20} cor="var(--cor-destaque)" traco={1.9} />
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{guide.tip}</div>
            </div>
          )}
        </div>
      </Cascata>
    );
  }

  if (guide.kind === 'texto') {
    return (
      <Cascata className="flex flex-col gap-[14px]">
        <Cabecalinho rotulo={mod.title} titulo={guide.title} />
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {guide.intro && <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)' }}>{guide.intro}</p>}
          <GuiaTexto guide={guide} locale={locale} />
        </div>
      </Cascata>
    );
  }

  if (guide.kind === 'audio') {
    return (
      <Cascata className="flex flex-col gap-[14px]">
        <Cabecalinho rotulo={mod.title} titulo={guide.title} />
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {guide.intro && <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)' }}>{guide.intro}</p>}
          <GuiaAudio guide={guide} locale={locale} />
        </div>
      </Cascata>
    );
  }

  if (guide.kind === 'pagina') {
    const estado = await estadoGuia(session.id, mod, guide.key);
    return (
      <Cascata className="flex flex-col gap-[14px]">
        <Cabecalinho rotulo={mod.title} titulo={guide.title} />
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {guide.intro && <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)' }}>{guide.intro}</p>}
          <GuiaPagina moduleKey={mod.key} guide={guide} marcadosIniciais={estado.marcados} locale={locale} />
        </div>
      </Cascata>
    );
  }

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <Cabecalinho rotulo={mod.title} titulo={guide.title} />
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {guide.intro && <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)' }}>{guide.intro}</p>}
        <GuiaPassos guide={guide} locale={locale} />
      </div>
    </Cascata>
  );
}
