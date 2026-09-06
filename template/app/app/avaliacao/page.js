import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getContent } from '@/lib/content';
import { getPerfil, moduloDeOnboarding } from '@/lib/dados/perfil';
import Assistente from '@/components/avaliacao/Assistente';

export const dynamic = 'force-dynamic';

export default async function AvaliacaoPage({ searchParams }) {
  const session = await getSession();
  const content = await getContent();
  const onboarding = moduloDeOnboarding(content);
  if (!onboarding) redirect('/app');

  const perfil = await getPerfil(session.id);
  const sp = await searchParams;
  const refazer = sp?.refazer === '1';

  return <Assistente calculadora={onboarding.calculadora} quiz={onboarding.quiz} perfil={perfil} refazer={refazer} locale={content.app?.locale} />;
}
