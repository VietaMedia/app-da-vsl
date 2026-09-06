import Esqueleto from '@/components/ui/Esqueleto';

// Formato da tela de uma aula: cabeçalho, área de vídeo/leitura e checklist.
export default function CarregandoAula() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div style={{ padding: '60px 22px 0' }}><Esqueleto linhas={2} altura={22} /></div>
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="esqueleto-shimmer" style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 16, background: 'rgba(var(--cor-primaria-rgb), .08)' }} />
        <Esqueleto linhas={5} altura={16} />
      </div>
    </div>
  );
}
