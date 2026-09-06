import './globals.css';
import { getContent } from '@/lib/content';
import { tokensObjeto, fontsHref } from '@/lib/identidade/tokens';
import RegistrarSW from '@/components/RegistrarSW';
export async function generateMetadata() {
  const { app } = await getContent();
  return { title: app.name, description: app.description, manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, title: app.shortName, statusBarStyle: 'default' },
    icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' } };
}
export async function generateViewport() {
  const { theme } = await getContent();
  return { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: theme.primary };
}
export default async function RootLayout({ children }) {
  const config = await getContent();
  const vars = tokensObjeto(config);
  return (<html lang="pt-BR" style={vars}>
    <head>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontsHref(config)} />
    </head>
    <body className="min-h-dvh"><RegistrarSW />{children}</body></html>);
}
