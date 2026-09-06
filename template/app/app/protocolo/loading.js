import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela Protocolo: título, barra de fases e a lista de dias da semana.
export default function CarregandoProtocolo() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Esqueleto linhas={2} altura={20} />
        <Esqueleto linhas={1} altura={36} />
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 16 }}><Esqueleto linhas={2} altura={16} /></div>
        ))}
      </div>
    </div>
  );
}
