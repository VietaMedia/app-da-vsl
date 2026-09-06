import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela Eu: cabeçalho, três números lado a lado, gráfico e cartões
// empilhados (conquistas, diário, compartilhar).
export default function CarregandoEu() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 18px 0' }}><Esqueleto linhas={2} altura={20} /></div>
      <div style={{ padding: '0 18px' }}>
        <div className="card" style={{ display: 'flex', padding: 0 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1, padding: '14px 8px', borderLeft: i > 0 ? '1px solid var(--cor-linha)' : 'none' }}>
              <Esqueleto linhas={2} altura={16} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 18px' }}>
        <div className="card" style={{ padding: 16, height: 140 }}><Esqueleto linhas={1} altura={100} /></div>
      </div>
      <div style={{ padding: '0 18px' }}>
        <div className="card" style={{ padding: 16 }}><Esqueleto linhas={3} altura={18} /></div>
      </div>
    </div>
  );
}
