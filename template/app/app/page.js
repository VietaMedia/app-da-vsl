import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { getPerfil, perfilPronto } from '@/lib/dados/perfil';
import { resumoHoje } from '@/lib/dados/hoje';
import Icone from '@/components/ui/Icone';
import Cascata from '@/components/ui/Cascata';
import CartaoDia from '@/components/hoje/CartaoDia';
import CartaoMetrica from '@/components/hoje/CartaoMetrica';
import CartaoContador from '@/components/hoje/CartaoContador';
import TarefasDoDia from '@/components/hoje/TarefasDoDia';
import ProximaAula from '@/components/hoje/ProximaAula';
import DicaInstalar from '@/components/ui/DicaInstalar';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function AppHome() {
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const perfil = await getPerfil(session.id);
  if (!perfilPronto(perfil, content)) redirect('/app/avaliacao');

  const resumo = await resumoHoje(session.id, content, perfil);
  const modProtocolo = content.modules.find(m => m.type === 'protocolo');
  const locale = content.app?.locale || 'pt';

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(170deg, var(--cor-primaria-escura), var(--cor-primaria))',
          borderRadius: '0 0 var(--raio-g) var(--raio-g)',
          padding: '64px 22px 28px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>{resumo.dataFormatada}</div>
            <div className="display" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.05 }}>
              {resumo.saudacao}{resumo.nome ? `, ${resumo.nome}` : ''}
            </div>
            {resumo.tudoFeito && (
              <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>{t(locale, 'hoje.diaFechado')}</div>
            )}
          </div>
          <Link
            href="/app/eu#lembretes"
            style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Icone nome="bell" tamanho={22} cor="#fff" />
          </Link>
        </div>
        <CartaoDia protocolo={resumo.protocolo} metrica={resumo.metrica} locale={locale} />
      </div>

      {(resumo.metrica || resumo.contador) && (
        <div style={{ padding: '0 18px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {resumo.metrica && <CartaoMetrica metrica={resumo.metrica} locale={locale} />}
          {resumo.contador && <CartaoContador contador={resumo.contador} locale={locale} />}
        </div>
      )}
      {resumo.protocolo && modProtocolo && (
        <div style={{ padding: '0 18px' }}>
          <TarefasDoDia
            moduleKey={modProtocolo.key}
            diaAtual={resumo.protocolo.diaAtual}
            tarefas={resumo.protocolo.tarefasHoje}
            totalHoje={resumo.protocolo.totalHoje}
            locale={locale}
          />
        </div>
      )}
      {resumo.proximaAula && (
        <div style={{ padding: '0 18px' }}>
          <ProximaAula aula={resumo.proximaAula} locale={locale} />
        </div>
      )}
      <div style={{ padding: '0 18px' }}>
        <DicaInstalar locale={locale} />
      </div>
    </Cascata>
  );
}
