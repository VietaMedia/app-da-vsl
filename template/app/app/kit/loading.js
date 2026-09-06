import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela Kit: cabeçalho e a lista de guias/itens.
export default function CarregandoKit() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 18px 0' }}><Esqueleto linhas={2} altura={20} /></div>
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="esqueleto-shimmer" style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(var(--cor-primaria-rgb), .08)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}><Esqueleto linhas={2} altura={14} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
