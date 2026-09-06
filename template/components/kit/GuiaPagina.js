'use client';
import { useState } from 'react';
import Markdown from '@/components/ui/Markdown';
import Checkbox from '@/components/ui/Checkbox';
import { indicesPorSecao } from '@/lib/modulos/guias';
import { t } from '@/lib/i18n';

// Guia tipo "pagina": um cartão por seção (título + corpo em Markdown) com um
// checklist opcional marcável via /api/modulos/guias/marcar (itemIndex =
// índice global cruzando os checklists das seções). Toggle otimista, com
// reversão se a chamada falhar — mesmo padrão de GuiaLista/GuiaReceita.
export default function GuiaPagina({ moduleKey, guide, marcadosIniciais, locale = 'pt' }) {
  const [marcados, setMarcados] = useState(new Set(marcadosIniciais));
  const [erro, setErro] = useState(null);
  const indices = indicesPorSecao(guide);

  async function alternar(itemIndex) {
    const anterior = new Set(marcados);
    const proximo = new Set(marcados);
    if (proximo.has(itemIndex)) proximo.delete(itemIndex); else proximo.add(itemIndex);
    setMarcados(proximo);
    try {
      const res = await fetch('/api/modulos/guias/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey, guideKey: guide.key, itemIndex }),
      });
      if (!res.ok) throw new Error(t(locale, 'erro.falhaMarcarItem'));
      setErro(null);
    } catch (e) {
      setMarcados(anterior);
      setErro(e.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {erro && <p style={{ color: '#B3261E', fontSize: 13 }}>{erro}</p>}
      {guide.sections.map((secao, i) => (
        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>{secao.title}</div>
          <div style={{ fontSize: 16, lineHeight: 1.5 }}>
            <Markdown text={secao.body || ''} />
          </div>
          {secao.checklist?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {secao.checklist.map((item, j) => {
                const itemIndex = indices[i][j];
                const marcado = marcados.has(itemIndex);
                const ultimo = j === secao.checklist.length - 1;
                return (
                  <div key={j} style={{ borderBottom: ultimo ? 'none' : '1px solid var(--cor-linha)' }}>
                    <Checkbox marcado={marcado} onChange={() => alternar(itemIndex)} label={item} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
