'use client';
import { useEffect, useState } from 'react';
import Icone from './Icone';
import { t } from '@/lib/i18n';

const CHAVE = 'dica-instalar-fechada';

// Convite discreto pra instalar o PWA na tela inicial — só aparece quando o
// app ainda não está rodando em modo standalone (instalado) e a pessoa ainda
// não fechou a dica antes (localStorage, por navegador/aparelho).
export default function DicaInstalar({ locale = 'pt' }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    try {
      const jaFechada = localStorage.getItem(CHAVE) === '1';
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setVisivel(!jaFechada && !standalone);
    } catch {
      setVisivel(false);
    }
  }, []);

  function fechar() {
    setVisivel(false);
    try { localStorage.setItem(CHAVE, '1'); } catch { /* localStorage indisponível — só some da sessão atual */ }
  }

  if (!visivel) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(var(--cor-primaria-rgb), .1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icone nome="share" tamanho={20} cor="var(--cor-primaria)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{t(locale, 'hoje.instaleApp')}</div>
          <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--cor-texto-suave)' }}>
            {t(locale, 'hoje.instrucaoIphone')}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--cor-texto-suave)' }}>
            {t(locale, 'hoje.instrucaoAndroid')}
          </div>
        </div>
      </div>
      <button
        onClick={fechar}
        style={{
          height: 44, flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', padding: '0 8px',
          fontSize: 14, fontWeight: 800, color: 'var(--cor-texto-suave)',
        }}
      >
        {t(locale, 'hoje.fechar')}
      </button>
    </div>
  );
}
