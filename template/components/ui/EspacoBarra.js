'use client';
import { usePathname } from 'next/navigation';
import { barraVisivel } from '@/lib/abas';

// Envolve o conteúdo das telas do app reservando o respiro de baixo (pb-28)
// só quando a BarraInferior está visível — em /app/avaliacao ela some, e o
// padding sozinho não faz sentido lá.
export default function EspacoBarra({ children }) {
  const pathname = usePathname();
  return (
    <div className={`mx-auto min-h-dvh w-full max-w-[430px] ${barraVisivel(pathname) ? 'pb-28' : ''}`}>
      {children}
    </div>
  );
}
