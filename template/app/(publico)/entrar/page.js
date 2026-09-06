import { getContent } from '@/lib/content';
import FormularioEntrar from '@/components/auth/FormularioEntrar';

export const dynamic = 'force-dynamic';

export default async function EntrarPage() {
  const { app, identity } = await getContent();
  return <FormularioEntrar app={app} symbol={identity.icon.symbol} locale={app.locale} />;
}
