'use client';
import { useRef, useState } from 'react';
import Botao from '@/components/ui/Botao';
import { t } from '@/lib/i18n';

// Extrai os `d="..."` de uma string SVG (formato de SIMBOLOS[x].paths) pra
// desenhar via Path2D no canvas.
function extrairPaths(svgString) {
  return [...(svgString || '').matchAll(/d="([^"]+)"/g)].map(m => m[1]);
}

function corVar(nome, fallback) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  return v || fallback;
}

// Cartão de progresso pra compartilhar: desenha uma imagem 1080×1350 no
// canvas (fundo gradiente da marca, dia N de M, sequência, delta da métrica,
// símbolo do app) e usa `navigator.share` com o arquivo quando disponível;
// senão mostra a imagem pra salvar manualmente. Sem animação (estático).
export default function CartaoCompartilhar({ appName, diaAtual, totalDias, streak, metricaTexto, symbolPaths, locale = 'pt' }) {
  const canvasRef = useRef(null);
  const [imagemUrl, setImagemUrl] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  async function desenhar() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const primaria = corVar('--cor-primaria', '#38a0b8');
    const primariaEscura = corVar('--cor-primaria-escura', '#1f5f70');
    const fonteDisplay = corVar('--fonte-display', "'Cormorant Garamond', serif");
    const familiaDisplay = fonteDisplay.split(',')[0].trim().replace(/^['"]|['"]$/g, '');

    if (document.fonts) {
      try { await document.fonts.load(`700 64px "${familiaDisplay}"`); } catch { /* segue mesmo assim */ }
      try { await document.fonts.ready; } catch { /* segue mesmo assim */ }
    }

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, primariaEscura);
    grad.addColorStop(1, primaria);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const paths = extrairPaths(symbolPaths);
    if (paths.length && typeof Path2D !== 'undefined') {
      ctx.save();
      ctx.translate(w / 2, h * 0.3);
      const escala = 14;
      ctx.scale(escala, escala);
      ctx.translate(-12, -12);
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.lineWidth = 1.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (const d of paths) ctx.stroke(new Path2D(d));
      ctx.restore();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';

    ctx.font = `700 52px ${fonteDisplay}`;
    ctx.fillText(appName, w / 2, h * 0.56);

    ctx.font = `700 92px ${fonteDisplay}`;
    ctx.fillText(t(locale, 'eu.diaNdeM', { n: diaAtual, m: totalDias }), w / 2, h * 0.67);

    ctx.font = '700 40px sans-serif';
    ctx.fillText(t(locale, 'eu.nDiasSeguidos', { n: streak }), w / 2, h * 0.75);

    if (metricaTexto) {
      ctx.font = '600 34px sans-serif';
      ctx.fillText(metricaTexto, w / 2, h * 0.81);
    }
  }

  async function compartilhar() {
    setGerando(true);
    setErro(null);
    try {
      await desenhar();
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error(t(locale, 'erro.falhaGerarImagem'));
      const file = new File([blob], 'progresso.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: appName, text: t(locale, 'eu.compartilharTexto', { appName }) });
      } else {
        setImagemUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      if (e?.name !== 'AbortError') setErro(t(locale, 'eu.erroGerarImagem'));
    } finally {
      setGerando(false);
    }
  }

  function fechar() {
    if (imagemUrl) URL.revokeObjectURL(imagemUrl);
    setImagemUrl(null);
  }

  return (
    <div className="card">
      <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{t(locale, 'eu.seuProgressoImagem')}</div>
      <Botao pequeno icone="share" onClick={compartilhar} carregando={gerando}>{t(locale, 'eu.compartilharProgresso')}</Botao>
      {erro && <p style={{ color: '#B3261E', fontSize: 13, marginTop: 8 }}>{erro}</p>}
      <canvas ref={canvasRef} width={1080} height={1350} style={{ display: 'none' }} aria-hidden="true" />
      {imagemUrl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, maxWidth: 340, width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <img src={imagemUrl} alt={t(locale, 'eu.altCartaoProgresso')} style={{ width: '100%', borderRadius: 12, display: 'block' }} />
            <p style={{ fontSize: 13, textAlign: 'center', color: 'var(--cor-texto-suave)' }}>{t(locale, 'eu.segureImagem')}</p>
            <Botao variante="secundario" pequeno onClick={fechar}>{t(locale, 'hoje.fechar')}</Botao>
          </div>
        </div>
      )}
    </div>
  );
}
