// SVGs de linha, grandes (420×300), usados como textura translúcida nos cabeçalhos.
// Mesmo estilo de traço (2 px) do `leaf` de Metodo.dc.html.
const ILUSTRACOES = {
  leaf: '<path d="M60 260C60 120 150 60 300 40c-15 150-90 220-240 220z"/><path d="M60 260c50-80 120-140 200-190"/><path d="M110 210c20-5 45-8 70-9M150 160c20-6 40-10 65-12"/>',
  wave: '<path d="M20 100c40-55 80-55 120 0s80 55 120 0 80-55 120 0"/><path d="M20 160c40-55 80-55 120 0s80 55 120 0 80-55 120 0"/><path d="M20 220c40-55 80-55 120 0s80 55 120 0 80-55 120 0"/>',
  gear: '<circle cx="210" cy="150" r="95"/><circle cx="210" cy="150" r="42"/><path d="M210 35v25M210 240v25M75 150h25M320 150h25M112 52l16 16M292 52l-16 16M112 248l16-16M292 248l-16-16"/>',
  pulse: '<path d="M20 160h55l22-70 38 140 28-110 18 40h55l22-45 18 45h124"/>',
  coins: '<ellipse cx="140" cy="230" rx="95" ry="24"/><ellipse cx="140" cy="198" rx="95" ry="24"/><ellipse cx="140" cy="166" rx="95" ry="24"/><ellipse cx="290" cy="120" rx="72" ry="20"/><ellipse cx="290" cy="92" rx="72" ry="20"/>',
  sparkles: '<path d="M120 70l16 46 46 16-46 16-16 46-16-46-46-16 46-16z"/><path d="M300 150l10 28 28 10-28 10-10 28-10-28-28-10 28-10z"/><path d="M230 210l7 18 18 7-18 7-7 18-7-18-18-7 18-7z"/>',
};

export default function Ilustracao({ nome = 'leaf', cor = 'currentColor', className, style }) {
  const d = ILUSTRACOES[nome] || ILUSTRACOES.leaf;
  return (
    <svg
      width="420"
      height="300"
      viewBox="0 0 420 300"
      fill="none"
      stroke={cor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block', ...style }}
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}
