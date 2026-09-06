import { getContent } from '@/lib/content';
import PainelBarra from '@/components/painel/PainelBarra';

export default async function PainelLayout({ children }) {
  const { app, identity } = await getContent();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--cor-fundo)' }}>
      <PainelBarra appName={app.name} symbol={identity.icon.symbol} />
      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}
