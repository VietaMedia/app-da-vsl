import Link from 'next/link';
import Icone from '@/components/ui/Icone';
import { t } from '@/lib/i18n';

// Cartão "Próxima aula" na tela Hoje. Só renderiza quando `aula` existe —
// a Task 8 é quem preenche isso via progressoTrilha.
export default function ProximaAula({ aula, locale = 'pt' }) {
  if (!aula) return null;
  return (
    <Link
      href={aula.href}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18,
        background: 'linear-gradient(135deg, var(--cor-suave), var(--cor-fundo))',
        border: '1px solid var(--cor-linha)', textDecoration: 'none', color: 'inherit',
      }}
    >
      <Icone nome="spark" tamanho={22} cor="var(--cor-destaque)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{t(locale, 'hoje.proximaAula', { titulo: aula.titulo })}</div>
        {aula.meta && <div style={{ fontSize: 12, color: 'var(--cor-texto-suave)' }}>{aula.meta}</div>}
      </div>
      <Icone nome="chev" tamanho={18} cor="var(--cor-destaque)" />
    </Link>
  );
}
