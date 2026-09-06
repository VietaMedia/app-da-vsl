import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { getPerfil, moduloDeOnboarding } from '@/lib/dados/perfil';
import { resumoEu } from '@/lib/dados/eu';
import { perfilAtual } from '@/lib/quiz-puro';
import { SIMBOLOS } from '@/lib/identidade/simbolos';
import Cabecalho from '@/components/ui/Cabecalho';
import Cascata from '@/components/ui/Cascata';
import Icone from '@/components/ui/Icone';
import ResumoProgresso from '@/components/eu/ResumoProgresso';
import GraficoMetrica from '@/components/eu/GraficoMetrica';
import Conquistas from '@/components/eu/Conquistas';
import Diario from '@/components/eu/Diario';
import CartaoCompartilhar from '@/components/eu/CartaoCompartilhar';
import CartaoPerfil from '@/components/eu/CartaoPerfil';
import ListaLembretes from '@/components/eu/ListaLembretes';
import BotaoSair from '@/components/eu/BotaoSair';
import DicaInstalar from '@/components/ui/DicaInstalar';
import AvisoRodape from '@/components/ui/AvisoRodape';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

function LinhaAcao({ href, icone, titulo }) {
  return (
    <Link
      href={href}
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 56, padding: '14px 16px', textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(var(--cor-primaria-rgb), .1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icone nome={icone} tamanho={20} cor="var(--cor-primaria)" />
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, flex: 1 }}>{titulo}</span>
      <Icone nome="chev" tamanho={18} cor="var(--cor-texto-suave)" />
    </Link>
  );
}

export default async function EuPage() {
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const perfil = await getPerfil(session.id);
  const resumo = await resumoEu(session.id, content, { ...perfil, role: session.role });
  const locale = content.app?.locale || 'pt';

  const podeRefazer = !!moduloDeOnboarding(content);
  const perfilQuiz = perfilAtual(content, perfil);
  const simbolo = SIMBOLOS[content.identity?.icon?.symbol] || SIMBOLOS.leaf;
  const metricaTexto = resumo.metrica?.deltaDesdeInicio != null
    ? t(locale, 'hoje.desdeInicio', { sinal: resumo.metrica.deltaDesdeInicio > 0 ? '+' : '', delta: resumo.metrica.deltaDesdeInicio, unit: resumo.metrica.unit })
    : null;

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <Cabecalho
        rotulo={t(locale, 'eu.seuProgresso')}
        titulo={resumo.nome || t(locale, 'eu.voce')}
        subtitulo={resumo.desde}
        ilustracao={content.identity?.illustration}
      />

      <div style={{ padding: '0 18px' }}>
        <ResumoProgresso diasFeitos={resumo.diasFeitos} streak={resumo.streak} semanas={resumo.semanas} locale={locale} />
      </div>

      {resumo.metrica && (
        <div style={{ padding: '0 18px' }}>
          <GraficoMetrica metrica={resumo.metrica} locale={locale} />
        </div>
      )}

      {perfilQuiz && (
        <div style={{ padding: '0 18px' }}>
          <CartaoPerfil profile={perfilQuiz.profile} locale={locale} />
        </div>
      )}

      <div style={{ padding: '0 18px' }}>
        <Conquistas lista={resumo.conquistas} locale={locale} />
      </div>

      <div style={{ padding: '0 18px' }}>
        <Diario notasIniciais={resumo.notas} locale={locale} />
      </div>

      <div style={{ padding: '0 18px' }}>
        <CartaoCompartilhar
          appName={content.app?.name || ''}
          diaAtual={resumo.diaAtual != null ? resumo.diaAtual : resumo.diasFeitos}
          totalDias={resumo.totalDias}
          streak={resumo.streak}
          metricaTexto={metricaTexto}
          symbolPaths={simbolo.paths}
          locale={locale}
        />
      </div>

      {resumo.lembretes && (
        <div style={{ padding: '0 18px' }}>
          <ListaLembretes moduleKey={resumo.lembretes.moduleKey} itens={resumo.lembretes.items} feitosIniciais={resumo.lembretes.feitosHoje} locale={locale} />
        </div>
      )}

      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {podeRefazer && <LinhaAcao href="/app/avaliacao?refazer=1" icone="refresh" titulo={t(locale, 'eu.refazerAvaliacao')} />}
        {resumo.ehDono && <LinhaAcao href="/painel" icone="lock" titulo={t(locale, 'eu.painelDono')} />}
        <div className="card" style={{ padding: 0 }}>
          <BotaoSair locale={locale} />
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        <DicaInstalar locale={locale} />
      </div>

      {content.app?.notice && (
        <div style={{ padding: '0 18px' }}>
          <AvisoRodape texto={content.app.notice} />
        </div>
      )}
    </Cascata>
  );
}
