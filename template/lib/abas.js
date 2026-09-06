import { t } from '@/lib/i18n';

// Pura: deriva as abas da barra inferior a partir do conteúdo do app.
// Ordem fixa: hoje · protocolo (se houver módulo protocolo) · aulas (se houver trilha) ·
// kit (se houver guias ou biblioteca) · eu. Rótulos no locale de `content.app.locale`.
export function abasDoConfig(content) {
  const modules = content?.modules || [];
  const locale = content?.app?.locale || 'pt';
  const tem = tipo => modules.some(m => m.type === tipo);
  const abas = [{ key: 'hoje', label: t(locale, 'abas.hoje'), href: '/app', icone: 'home' }];
  if (tem('protocolo')) abas.push({ key: 'protocolo', label: t(locale, 'abas.protocolo'), href: '/app/protocolo', icone: 'list' });
  if (tem('trilha')) abas.push({ key: 'aulas', label: t(locale, 'abas.aulas'), href: '/app/aulas', icone: 'play' });
  if (tem('guias') || tem('biblioteca')) abas.push({ key: 'kit', label: t(locale, 'abas.kit'), href: '/app/kit', icone: 'basket' });
  abas.push({ key: 'eu', label: t(locale, 'abas.eu'), href: '/app/eu', icone: 'user' });
  return abas;
}

// Pura: a barra inferior (e o respiro que ela reserva no fim da tela) some em
// /app/avaliacao — a tela de onboarding usa o espaço inteiro.
export function barraVisivel(pathname) {
  return !pathname?.startsWith('/app/avaliacao');
}
