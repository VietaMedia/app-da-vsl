import Link from 'next/link';
import Icone from '@/components/ui/Icone';
import { t } from '@/lib/i18n';

// Cartão "Seu perfil" na tela /app/eu: título e descrição do perfil de quiz
// do usuário, com link pra ver os ajustes completos em /app/eu/perfil.
// Server-safe (sem estado). Só aparece quando o usuário tem um perfil de quiz.
export default function CartaoPerfil({ profile, locale = 'pt' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--cor-primaria)' }}>
        {t(locale, 'eu.seuPerfil')}
      </div>
      <div className="display" style={{ fontSize: 22, fontWeight: 700 }}>{profile.title}</div>
      <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)', lineHeight: 1.5 }}>{profile.description}</p>
      <Link
        href="/app/eu/perfil"
        style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start', fontSize: 14, fontWeight: 800, color: 'var(--cor-primaria)', textDecoration: 'none' }}
      >
        {t(locale, 'eu.verAjustes')}
        <Icone nome="chev" tamanho={16} cor="var(--cor-primaria)" traco={2.4} />
      </Link>
    </div>
  );
}
