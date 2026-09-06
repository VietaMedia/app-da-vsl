import Icone from './Icone';

// Aviso discreto no rodapé (ex.: nota de saúde/legal do dono) — baixo
// contraste de propósito, não é um alerta nem um bloqueio.
export default function AvisoRodape({ texto }) {
  if (!texto) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 2px 18px' }}>
      <Icone nome="note" tamanho={15} cor="var(--cor-texto-suave)" />
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cor-texto-suave)' }}>{texto}</div>
    </div>
  );
}
