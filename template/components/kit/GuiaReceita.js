'use client';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import { t } from '@/lib/i18n';

// Guia tipo "receita": cartão de ingredientes com checkbox (toggle otimista
// via /api/modulos/guias/marcar, itemIndex = índice do ingrediente). Modo de
// preparo e dica não são marcáveis — ficam no server (na página).
export default function GuiaReceita({ moduleKey, guide, marcadosIniciais, locale = 'pt' }) {
  const [marcados, setMarcados] = useState(new Set(marcadosIniciais));
  const [erro, setErro] = useState(null);

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
    <Card>
      {erro && <p style={{ color: '#B3261E', fontSize: 13, marginBottom: 10 }}>{erro}</p>}
      <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t(locale, 'kit.ingredientes')}</div>
      {guide.ingredients.map((ingrediente, i) => (
        <div key={i} style={{ borderBottom: i < guide.ingredients.length - 1 ? '1px solid var(--cor-linha)' : 'none' }}>
          <Checkbox marcado={marcados.has(i)} onChange={() => alternar(i)} label={ingrediente} />
        </div>
      ))}
    </Card>
  );
}
