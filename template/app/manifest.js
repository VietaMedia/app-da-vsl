import { getContent } from '@/lib/content';
export const dynamic = 'force-dynamic';
export default async function manifest() {
  const { app, theme } = await getContent();
  return { name: app.name, short_name: app.shortName, description: app.description, start_url: '/app', display: 'standalone',
    background_color: theme.background, theme_color: theme.primary, lang: 'pt-BR',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ] };
}
