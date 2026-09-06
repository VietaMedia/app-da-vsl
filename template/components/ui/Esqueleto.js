// Placeholder de carregamento: barras com leve brilho pulsando (respeitando
// "reduzir movimento", via a classe utilitária .esqueleto-shimmer em
// globals.css, que cai pra opacidade fixa dentro de um
// @media (prefers-reduced-motion: reduce)).
export default function Esqueleto({ linhas = 3, altura = 16, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: linhas }).map((_, i) => (
        <div
          key={i}
          className="esqueleto-shimmer rounded-lg"
          style={{ height: altura, background: 'rgba(var(--cor-primaria-rgb), .08)', width: i === linhas - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}
