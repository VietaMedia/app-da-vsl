import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela de uma seção de aulas: cabeçalho com barra de progresso e a
// lista de aulas da seção.
export default function CarregandoSecaoAulas() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 20px 0' }}><Esqueleto linhas={2} altura={22} /></div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 16 }}><Esqueleto linhas={1} altura={16} /></div>
        ))}
      </div>
    </div>
  );
}
