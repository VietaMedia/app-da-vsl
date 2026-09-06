'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GraficoLinha from '@/components/ui/GraficoLinha';
import Botao from '@/components/ui/Botao';
import Icone from '@/components/ui/Icone';
import { t } from '@/lib/i18n';

// Cartão da métrica na tela Eu: gráfico com meta e área suave, último valor +
// delta, e o registro de hoje (input 56 px + "Registrar hoje"). Atualização
// otimista no gráfico; `router.refresh()` busca o estado real do servidor.
export default function GraficoMetrica({ metrica, locale = 'pt' }) {
  const goal = metrica.goal;
  const router = useRouter();
  const [registros, setRegistros] = useState(metrica.registros);
  const [ultimo, setUltimo] = useState(metrica.ultimo);
  const [valor, setValor] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function registrar() {
    const numero = Number(valor);
    if (valor.trim() === '' || !Number.isFinite(numero)) { setErro(t(locale, 'eu.informeValor')); return; }
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch('/api/modulos/rastreador/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey: metrica.moduleKey, value: numero }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(locale, 'erro.falhaRegistrar'));
      setRegistros(data.registros.slice(-30));
      setUltimo(data.ultimo);
      setValor('');
      router.refresh();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>{metrica.label}</div>
        {ultimo && (
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cor-primaria)' }}>
            {ultimo.value} {metrica.unit}
          </div>
        )}
      </div>
      {registros.length > 0 ? (
        <GraficoLinha regs={registros} min={metrica.min} max={metrica.max} goal={goal} locale={locale} />
      ) : (
        <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(var(--cor-primaria-rgb), .1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icone nome="scale" tamanho={22} cor="var(--cor-primaria)" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cor-texto)' }}>{t(locale, 'eu.nenhumRegistro')}</div>
          <div style={{ fontSize: 15, color: 'var(--cor-texto-suave)' }}>{t(locale, 'eu.anotePrimeiro')}</div>
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: metrica.deltaDesdeInicio != null ? 'var(--cor-primaria)' : 'var(--cor-texto-suave)', marginTop: 4 }}>
        {metrica.deltaDesdeInicio != null
          ? t(locale, 'hoje.desdeInicio', { sinal: metrica.deltaDesdeInicio > 0 ? '+' : '', delta: metrica.deltaDesdeInicio, unit: metrica.unit })
          : t(locale, 'hoje.registrePrimeiro')}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="number"
            step={metrica.step}
            min={metrica.min}
            max={metrica.max}
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder={t(locale, 'eu.registrarHoje')}
            style={{
              width: '100%', height: 56, borderRadius: 'var(--raio)', border: '1.5px solid var(--cor-linha)',
              padding: '0 44px 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--cor-texto)', background: '#fff',
            }}
          />
          <span style={{ position: 'absolute', right: 16, top: 0, height: 56, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: 'var(--cor-texto-suave)' }}>
            {metrica.unit}
          </span>
        </div>
        <div style={{ width: 140, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Botao pequeno onClick={registrar} carregando={enviando} style={{ fontSize: 14 }}>{t(locale, 'eu.registrarHoje')}</Botao>
        </div>
      </div>
      {erro && <p style={{ color: '#B3261E', fontSize: 13, marginTop: 8 }}>{erro}</p>}
    </div>
  );
}
