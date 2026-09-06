import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela de um guia (lista, receita ou passos): cabeçalho e um
// cartão com a lista de itens/passos.
export default function CarregandoGuia() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 20px 0' }}><Esqueleto linhas={2} altura={22} /></div>
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: 16 }}><Esqueleto linhas={5} altura={18} /></div>
      </div>
    </div>
  );
}
