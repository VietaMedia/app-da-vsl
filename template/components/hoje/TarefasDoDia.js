'use client';
import { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import Botao from '@/components/ui/Botao';
import { celebrar } from '@/lib/confete';
import { t } from '@/lib/i18n';

// Cartão "Seu dia N" da tela Hoje: uma linha por tarefa, checkin otimista
// (com reversão se a chamada falhar) e confete discreto quando a última
// tarefa do dia é marcada.
export default function TarefasDoDia({ moduleKey, diaAtual, tarefas: tarefasIniciais, totalHoje, locale = 'pt' }) {
  const [tarefas, setTarefas] = useState(tarefasIniciais);
  const [erro, setErro] = useState(null);
  const feitas = tarefas.filter(t => t.feita).length;
  const fechado = totalHoje > 0 && feitas === totalHoje;

  async function alternar(index, feitaAtual) {
    const anteriores = tarefas;
    const proximas = tarefas.map(t => (t.index === index ? { ...t, feita: !feitaAtual } : t));
    setTarefas(proximas);
    try {
      const res = await fetch('/api/modulos/protocolo/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey, day: diaAtual, taskIndex: index }),
      });
      if (!res.ok) throw new Error(t(locale, 'erro.falhaRegistrar'));
      setErro(null);
      const vaiFechar = totalHoje > 0 && proximas.filter(t => t.feita).length === totalHoje;
      if (vaiFechar && !feitaAtual) await celebrar();
    } catch (e) {
      setTarefas(anteriores);
      setErro(e.message);
    }
  }

  return (
    <div className="card" style={fechado ? { borderColor: 'var(--cor-destaque)' } : undefined}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 10 }}>
        <div className="display" style={{ fontSize: 20, fontWeight: 700 }}>
          {fechado ? t(locale, 'hoje.diaFechado') : t(locale, 'hoje.seuDia', { n: diaAtual })}
        </div>
        {!fechado && (
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--cor-destaque)', whiteSpace: 'nowrap' }}>
            {t(locale, 'hoje.xDeYFeito', { x: feitas, y: totalHoje })}
          </div>
        )}
      </div>
      {erro && <p style={{ color: '#B3261E', fontSize: 13 }}>{erro}</p>}
      <div>
        {tarefas.map((tarefa, i) => (
          <div key={tarefa.index} style={{ borderBottom: i < tarefas.length - 1 ? '1px solid var(--cor-linha)' : 'none' }}>
            <Checkbox marcado={tarefa.feita} onChange={() => alternar(tarefa.index, tarefa.feita)} label={tarefa.texto} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <Botao variante="secundario" pequeno href="/app/protocolo" icone="chev">{t(locale, 'hoje.abrirProtocolo')}</Botao>
      </div>
    </div>
  );
}
