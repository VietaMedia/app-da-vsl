'use client';
import { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { celebrar } from '@/lib/confete';
import { t } from '@/lib/i18n';

// Checklist de um dia do protocolo (client island): checkin otimista, com
// reversão se a chamada falhar. Só o dia atual e os anteriores podem marcar —
// um dia futuro abre só pra leitura. Confete quando o dia atual fecha.
export default function DiaAberto({ moduleKey, day, diaAtual, tasks, checadosIniciais, locale = 'pt' }) {
  const [checados, setChecados] = useState(new Set(checadosIniciais));
  const [erro, setErro] = useState(null);
  const habilitado = day <= diaAtual;

  async function alternar(i) {
    if (!habilitado) return;
    const anterior = new Set(checados);
    const proximo = new Set(checados);
    if (proximo.has(i)) proximo.delete(i); else proximo.add(i);
    setChecados(proximo);
    try {
      const res = await fetch('/api/modulos/protocolo/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey, day, taskIndex: i }),
      });
      if (!res.ok) throw new Error(t(locale, 'erro.falhaRegistrar'));
      setErro(null);
      const vaiFechar = day === diaAtual && tasks.length > 0 && proximo.size === tasks.length;
      if (vaiFechar && !anterior.has(i)) await celebrar();
    } catch (e) {
      setChecados(anterior);
      setErro(e.message);
    }
  }

  return (
    <div className="card">
      {erro && <p style={{ color: '#B3261E', fontSize: 13 }}>{erro}</p>}
      {tasks.map((tarefa, i) => (
        <div key={i} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--cor-linha)' : 'none' }}>
          <Checkbox marcado={checados.has(i)} onChange={() => alternar(i)} label={tarefa} desabilitado={!habilitado} />
        </div>
      ))}
    </div>
  );
}
