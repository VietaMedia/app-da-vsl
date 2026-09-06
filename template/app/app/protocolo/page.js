import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { getPerfil } from '@/lib/dados/perfil';
import { estadoProtocolo } from '@/lib/dados/protocolo';
import Cascata from '@/components/ui/Cascata';
import BarraFases from '@/components/protocolo/BarraFases';
import SemanaProtocolo from '@/components/protocolo/SemanaProtocolo';
import AvisoRodape from '@/components/ui/AvisoRodape';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function ProtocoloPage() {
  const content = await getContent();
  const session = await getSession();
  if (!session) redirect('/entrar');

  const mod = content.modules.find(m => m.type === 'protocolo');
  if (!mod) notFound();

  const perfil = await getPerfil(session.id);
  const estado = await estadoProtocolo(session.id, mod, perfil?.startDate || null);
  const locale = content.app?.locale || 'pt';

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.8px', color: 'var(--cor-destaque)', textTransform: 'uppercase' }}>
            {t(locale, 'protocolo.protocoloDeNDias', { n: estado.totalDias })}
          </div>
          <div className="display" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.05, color: 'var(--cor-primaria-escura)' }}>
            {estado.faseAtual?.title || mod.title}
          </div>
        </div>
        <BarraFases fases={estado.fases} diaAtual={estado.diaAtual} locale={locale} />
      </div>
      <SemanaProtocolo days={mod.content.days} checkins={estado.checkins} diaAtual={estado.diaAtual} locale={locale} />
      {content.app?.notice && (
        <div style={{ padding: '0 20px' }}>
          <AvisoRodape texto={content.app.notice} />
        </div>
      )}
    </Cascata>
  );
}
