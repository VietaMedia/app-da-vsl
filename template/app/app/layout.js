import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { requireUser } from '@/lib/auth';
import { abasDoConfig } from '@/lib/abas';
import BarraInferior from '@/components/ui/BarraInferior';
import EspacoBarra from '@/components/ui/EspacoBarra';

export default async function AppLayout({ children }) {
  try { await requireUser(); } catch { redirect('/entrar'); }
  const content = await getContent();
  return (
    <>
      <EspacoBarra>{children}</EspacoBarra>
      <BarraInferior abas={abasDoConfig(content)} />
    </>
  );
}
