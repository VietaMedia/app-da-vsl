import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela Aulas: cabeçalho com progresso e a lista de seções.
export default function CarregandoAulas() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 18px 0' }}><Esqueleto linhas={2} altura={20} /></div>
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 16 }}><Esqueleto linhas={2} altura={16} /></div>
        ))}
      </div>
    </div>
  );
}
