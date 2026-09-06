import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { getSession } from '@/lib/auth';
import { getPerfil } from '@/lib/dados/perfil';
import { perfilAtual } from '@/lib/quiz-puro';
import Icone from '@/components/ui/Icone';
import Markdown from '@/components/ui/Markdown';
import Cascata from '@/components/ui/Cascata';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

// Tela de ajustes do perfil de quiz do usuário: mostra o markdown de `ajustes`
// do perfil resultante, com cabeçalho e botão de voltar pra /app/eu.
export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect('/entrar');

  const content = await getContent();
  const perfil = await getPerfil(session.id);
  const atual = perfilAtual(content, perfil);
  if (!atual) notFound();
  const locale = content.app?.locale || 'pt';

  return (
    <Cascata className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/app/eu"
            style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1px solid var(--cor-linha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icone nome="back" tamanho={22} cor="var(--cor-texto)" traco={2.2} />
          </Link>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--cor-destaque)' }}>{t(locale, 'eu.seuPerfil')}</div>
        </div>
        <div className="display" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.05, color: 'var(--cor-primaria-escura)' }}>{atual.profile.title}</div>
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <div className="card">
          <Markdown text={atual.profile.ajustes} />
        </div>
      </div>
    </Cascata>
  );
}
