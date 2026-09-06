import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { progressoTrilha } from '@/lib/dados/aulas';
import { minutosDeLeitura } from '@/lib/aulas-puro';
import { embedUrl } from '@/lib/modulos/video';
import Cabecalho from '@/components/ui/Cabecalho';
import Cascata from '@/components/ui/Cascata';
import Markdown from '@/components/ui/Markdown';
import Leitura from '@/components/aulas/Leitura';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function AulaPage({ params }) {
  const { section, step } = await params;
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const mod = content.modules.find(m => m.type === 'trilha');
  const secao = mod?.content.sections.find(s => s.key === section);
  const passo = secao?.steps.find(p => p.key === step);
  if (!mod || !secao || !passo) notFound();

  const progresso = await progressoTrilha(session.id, mod);
  const concluido = progresso.feitos.some(f => f.stepKey === passo.key && f.itemIndex === -1);
  const itensFeitos = progresso.feitos.filter(f => f.stepKey === passo.key && f.itemIndex >= 0).map(f => f.itemIndex);

  const todosOsPassos = mod.content.sections.flatMap(s => s.steps.map(p => ({ sectionKey: s.key, stepKey: p.key })));
  const idxAtual = todosOsPassos.findIndex(p => p.sectionKey === secao.key && p.stepKey === passo.key);
  const proximo = todosOsPassos[idxAtual + 1] || null;
  const ehUltima = !proximo;
  const proximaHref = proximo ? `/app/aulas/${proximo.sectionKey}/${proximo.stepKey}` : '/app/aulas';

  const minutos = minutosDeLeitura(passo.body || '');
  const video = embedUrl(passo.videoUrl);
  const locale = content.app?.locale || 'pt';

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <Cabecalho voltarHref={`/app/aulas/${secao.key}`} rotulo={secao.title} titulo={passo.title} tamanhoTitulo={30} />
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cor-texto-suave)' }}>{t(locale, 'hoje.minDeLeitura', { min: minutos })}</div>
        {video && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden' }}>
            <iframe
              src={video}
              title={passo.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
        <div className="leitura">
          <Markdown text={passo.body || ''} />
        </div>
        <Leitura
          moduleKey={mod.key}
          stepKey={passo.key}
          checklist={passo.checklist || []}
          itensFeitosIniciais={itensFeitos}
          concluidoInicial={concluido}
          proximaHref={proximaHref}
          ehUltima={ehUltima}
          locale={locale}
        />
      </div>
    </Cascata>
  );
}
