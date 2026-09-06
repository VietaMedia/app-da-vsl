'use client';
import { useState } from 'react';
import Markdown from '@/components/ui/Markdown';
import Botao from '@/components/ui/Botao';
import { t } from '@/lib/i18n';

// Copia o texto pra área de transferência, com fallback pra navegadores/contextos
// sem `navigator.clipboard` (ex.: http sem contexto seguro).
async function copiarTexto(texto) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(texto);
    return;
  }
  const area = document.createElement('textarea');
  area.value = texto;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
}

function BlocoTexto({ bloco, locale = 'pt' }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await copiarTexto(bloco.body);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // cópia não é crítica pro fluxo — ignora falha silenciosamente
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        {bloco.heading && <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>{bloco.heading}</div>}
        {bloco.copiavel !== false && (
          <Botao
            variante="secundario" pequeno onClick={copiar}
            style={{ width: 'auto', minWidth: 44, height: 44, padding: '0 16px', flexShrink: 0, marginLeft: 'auto' }}
          >
            {copiado ? t(locale, 'kit.copiado') : t(locale, 'kit.copiar')}
          </Botao>
        )}
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.5 }}>
        <Markdown text={bloco.body || ''} />
      </div>
    </div>
  );
}

// Guia tipo "texto": cada bloco em um cartão, com heading opcional e botão
// "Copiar" (44px+) quando o bloco é copiável. Não tem itens marcáveis.
export default function GuiaTexto({ guide, locale = 'pt' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {guide.blocks.map((bloco, i) => <BlocoTexto key={i} bloco={bloco} locale={locale} />)}
    </div>
  );
}
