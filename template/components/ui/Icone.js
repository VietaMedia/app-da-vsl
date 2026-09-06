import { paths, NOMES } from './icones-paths';

export { paths, NOMES };

export default function Icone({ nome, tamanho = 22, cor = 'currentColor', traco = 1.8, className, style }) {
  const d = paths[nome];
  if (!d) return null;
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}
