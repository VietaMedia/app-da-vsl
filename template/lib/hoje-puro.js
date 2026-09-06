import { SAUDACOES } from './identidade/climas';

// Pura: escolhe a saudação certa pro tom da marca conforme a hora (0-23) e o
// locale do app ('pt'/'es'/'en'; cai pro pt quando o locale é desconhecido).
export function saudacaoPara(hora, tom = 'caloroso', locale = 'pt') {
  const porLocale = SAUDACOES[locale] || SAUDACOES.pt;
  const s = porLocale[tom] || porLocale.caloroso;
  if (hora < 12) return s.manha;
  if (hora < 18) return s.tarde;
  return s.noite;
}

// Pura: tira o prefixo "<Fase> · " e um sufixo " (n/7)" do título do dia,
// sobrando só o tema da semana pra exibir em destaque.
export function temaDaSemana(titulo) {
  if (!titulo) return '';
  const idx = titulo.indexOf(' · ');
  const semPrefixo = idx === -1 ? titulo : titulo.slice(idx + 3);
  return semPrefixo.replace(/\s*\(\d+\/\d+\)\s*$/, '').trim();
}

// Pura: aplica um delta a um valor, sem deixar passar de 0 nem de `max`.
// Usada tanto na atualização otimista do cliente quanto documentada aqui pra
// espelhar o clamp que a query atômica faz no banco.
export function aplicarDelta(atual, delta, max) {
  return Math.min(max, Math.max(0, atual + delta));
}
