import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela de um dia do protocolo: cabeçalho, dica e lista de tarefas.
export default function CarregandoDiaProtocolo() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 18px 0' }}><Esqueleto linhas={2} altura={22} /></div>
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ padding: 16 }}><Esqueleto linhas={1} altura={18} /></div>
        <div className="card" style={{ padding: 16 }}><Esqueleto linhas={4} altura={18} /></div>
      </div>
    </div>
  );
}
