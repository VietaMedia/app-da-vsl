import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela Hoje: bloco de cabeçalho colorido, dois cartões lado a
// lado (métrica/contador) e uma lista de tarefas do dia.
export default function CarregandoHoje() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div
        style={{
          borderRadius: '0 0 var(--raio-g) var(--raio-g)',
          padding: '64px 22px 28px',
          background: 'rgba(var(--cor-primaria-rgb), .08)',
        }}
      >
        <Esqueleto linhas={2} altura={18} />
      </div>
      <div style={{ padding: '0 18px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 14 }}><Esqueleto linhas={2} altura={20} /></div>
        <div className="card" style={{ padding: 14 }}><Esqueleto linhas={2} altura={20} /></div>
      </div>
      <div style={{ padding: '0 18px' }}>
        <div className="card" style={{ padding: 16 }}><Esqueleto linhas={4} altura={18} /></div>
      </div>
    </div>
  );
}
