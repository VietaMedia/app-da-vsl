'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cascata from '@/components/ui/Cascata';
import Botao from '@/components/ui/Botao';
import Icone from '@/components/ui/Icone';
import { SIMBOLOS } from '@/lib/identidade/simbolos';
import { t } from '@/lib/i18n';

function BlocoIcone({ simbolo, tamanho = 84, raio = 24 }) {
  const s = SIMBOLOS[simbolo] || SIMBOLOS.bowl;
  const symbolSize = Math.round(tamanho * 0.62);
  const accent = s.accentPath ? `<path d="${s.accentPath}" fill="var(--cor-destaque)" stroke="var(--cor-destaque)"/>` : '';
  return (
    <div
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: raio,
        background: 'linear-gradient(160deg, var(--cor-primaria) 0%, var(--cor-primaria-escura) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--sombra-primaria-escura)',
        flexShrink: 0,
      }}
    >
      <svg
        width={symbolSize}
        height={symbolSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--cor-fundo)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: s.paths + accent }}
      />
    </div>
  );
}

export default function FormularioEntrar({ app, symbol, locale = 'pt' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [precisaPin, setPrecisaPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(precisaPin ? { email, pin } : { email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.precisaPin) setPrecisaPin(true);
        setError(data.error || t(locale, 'login.erroGenerico'));
        return;
      }
      router.push(data.onboardingPendente ? '/app/avaliacao' : '/app');
    } catch {
      setError(t(locale, 'login.erroGenerico'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(120% 60% at 50% -10%, var(--cor-suave) 0%, var(--cor-fundo) 60%)',
        }}
      />
      <div style={{ position: 'absolute', right: -60, top: 80, width: 260, height: 260, borderRadius: '50%', background: 'var(--cor-primaria)', opacity: 0.06 }} />
      <div style={{ position: 'absolute', left: -80, top: 300, width: 220, height: 220, borderRadius: '50%', background: 'var(--cor-destaque)', opacity: 0.07 }} />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '96px 28px 40px',
          gap: 28,
          maxWidth: 430,
          width: '100%',
          marginInline: 'auto',
        }}
      >
        <Cascata className="flex flex-col gap-7">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <BlocoIcone simbolo={symbol} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className="display" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: '-.5px', color: 'var(--cor-primaria-escura)' }}>
                {app.name}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cor-texto-suave)', letterSpacing: '.3px' }}>
                {app.slogan}
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            <div className="display" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.15, color: 'var(--cor-texto)' }}>
              {t(locale, 'login.titulo')}
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--cor-texto-suave)' }}>
              {t(locale, 'login.fraseAntes')}
              {t(locale, 'login.fraseDestaque') && (
                <strong style={{ color: 'var(--cor-texto)' }}>{t(locale, 'login.fraseDestaque')}</strong>
              )}
              {t(locale, 'login.fraseDepois')}
            </div>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 16px',
                background: '#FFFFFF', border: '1.5px solid var(--cor-linha)', borderRadius: 'var(--raio)',
              }}
            >
              <Icone nome="mail" tamanho={22} cor="var(--cor-texto-suave)" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={t(locale, 'login.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--cor-texto)' }}
              />
            </div>
            {precisaPin && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 16px',
                  background: '#FFFFFF', border: '1.5px solid var(--cor-linha)', borderRadius: 'var(--raio)',
                }}
              >
                <Icone nome="lock" tamanho={22} cor="var(--cor-texto-suave)" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  placeholder={t(locale, 'login.pinPlaceholder')}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--cor-texto)' }}
                />
              </div>
            )}
            {error && <p style={{ fontSize: 13, color: '#C0392B', marginTop: -6 }}>{error}</p>}
            <Botao type="submit" variante="primario" icone={!loading ? 'chev' : undefined} carregando={loading}>
              {!loading && t(locale, 'login.botaoEntrar')}
            </Botao>
          </form>

        </Cascata>

        <div style={{ flex: 1 }} />

        {app.supportEmail && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--cor-texto-suave)' }}>
            {t(locale, 'login.ajuda')}{' '}
            <a href={`mailto:${app.supportEmail}`} style={{ fontWeight: 700, color: 'var(--cor-primaria)' }}>
              {t(locale, 'login.faleSuporte')}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
