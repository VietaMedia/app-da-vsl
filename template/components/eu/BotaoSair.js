'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icone from '@/components/ui/Icone';
import { t } from '@/lib/i18n';

// Linha de ação "Sair": desloga no servidor e manda pra tela de entrar.
export default function BotaoSair({ locale = 'pt' }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/entrar');
    }
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      aria-busy={saindo}
      style={{
        width: '100%', minHeight: 56, display: 'flex', alignItems: 'center', gap: 14,
        padding: '0 16px', border: 'none', background: 'transparent', textAlign: 'left',
        font: 'inherit', color: '#B3261E', cursor: saindo ? 'default' : 'pointer', opacity: saindo ? 0.7 : 1,
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(179,38,30,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icone nome="logout" tamanho={20} cor="#B3261E" />
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, flex: 1 }}>{saindo ? t(locale, 'eu.saindo') : t(locale, 'eu.sair')}</span>
    </button>
  );
}
