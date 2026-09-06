'use client';
import { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import Botao from '@/components/ui/Botao';
import { t } from '@/lib/i18n';

// Checklist + rodapé da aula (client island): toggle otimista de cada item e
// do "passo inteiro" (itemIndex -1), com reversão se a chamada falhar. Quando
// concluída, o rodapé vira "Concluída" (secundário, ainda alternável) + botão
// pra próxima aula (ou "Voltar às aulas" na última).
export default function Leitura({ moduleKey, stepKey, checklist, itensFeitosIniciais, concluidoInicial, proximaHref, ehUltima, locale = 'pt' }) {
  const [itensFeitos, setItensFeitos] = useState(new Set(itensFeitosIniciais));
  const [concluido, setConcluido] = useState(concluidoInicial);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(itemIndex) {
    const res = await fetch('/api/modulos/trilha/progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleKey, stepKey, itemIndex }),
    });
    if (!res.ok) throw new Error(t(locale, 'erro.falhaRegistrar'));
  }

  async function alternarItem(itemIndex) {
    const anterior = new Set(itensFeitos);
    const proximo = new Set(itensFeitos);
    if (proximo.has(itemIndex)) proximo.delete(itemIndex); else proximo.add(itemIndex);
    setItensFeitos(proximo);
    try {
      await enviar(itemIndex);
      setErro(null);
    } catch (e) {
      setItensFeitos(anterior);
      setErro(e.message);
    }
  }

  async function alternarConclusao() {
    if (enviando) return;
    setEnviando(true);
    const anterior = concluido;
    setConcluido(!anterior);
    try {
      await enviar(-1);
      setErro(null);
    } catch (e) {
      setConcluido(anterior);
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {erro && <p style={{ color: '#B3261E', fontSize: 13 }}>{erro}</p>}
      {checklist.length > 0 && (
        <div className="card" style={{ padding: '4px 14px' }}>
          {checklist.map((item, i) => (
            <div key={i} style={{ borderBottom: i < checklist.length - 1 ? '1px solid var(--cor-linha)' : 'none' }}>
              <Checkbox marcado={itensFeitos.has(i)} onChange={() => alternarItem(i)} label={item} />
            </div>
          ))}
        </div>
      )}
      {concluido ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Botao variante="secundario" onClick={alternarConclusao} carregando={enviando}>{t(locale, 'aulas.concluida')}</Botao>
          <Botao variante="primario" href={proximaHref} icone="chev">{ehUltima ? t(locale, 'aulas.voltarAsAulas') : t(locale, 'aulas.proximaAula')}</Botao>
        </div>
      ) : (
        <Botao variante="primario" onClick={alternarConclusao} carregando={enviando}>{t(locale, 'aulas.concluirAula')}</Botao>
      )}
    </div>
  );
}
