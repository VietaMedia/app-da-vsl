'use client';
import Link from 'next/link';
import Icone from '@/components/ui/Icone';
import NumeroAnimado from '@/components/ui/NumeroAnimado';
import { t } from '@/lib/i18n';

// Quantas casas decimais o valor tem (ex.: 82.5 → 1, 82 → 0) — usada pra
// manter a mesma precisão durante o count-up, sem virar 82.4999... no meio.
function casasDecimais(valor) {
  const s = String(valor);
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
}

// Cartão do grid de 2 colunas na tela Hoje: último valor registrado do
// rastreador e a variação desde o primeiro registro. Leva pro perfil (`/app/eu`),
// onde o histórico completo vive.
export default function CartaoMetrica({ metrica, locale = 'pt' }) {
  if (!metrica) return null;
  const { label, unit, ultimo, deltaDesdeInicio } = metrica;
  return (
    <Link href="/app/eu" className="card" style={{ display: 'block', padding: 14, textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(var(--cor-primaria-rgb), .1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icone nome="scale" tamanho={20} cor="var(--cor-primaria)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cor-texto-suave)' }}>{label.toUpperCase()}</div>
          {ultimo ? (
            <div className="display" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
              <NumeroAnimado valor={ultimo.value} formatar={v => v.toFixed(casasDecimais(ultimo.value))} />{' '}
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cor-texto-suave)' }}>{unit}</span>
            </div>
          ) : (
            <div className="display" style={{ fontSize: 16, fontWeight: 700 }}>—</div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: deltaDesdeInicio != null ? 'var(--cor-primaria)' : 'var(--cor-texto-suave)' }}>
        {deltaDesdeInicio != null
          ? t(locale, 'hoje.desdeInicio', { sinal: deltaDesdeInicio > 0 ? '+' : '', delta: deltaDesdeInicio, unit })
          : t(locale, 'hoje.registrePrimeiro')}
      </div>
    </Link>
  );
}
