// Puras: sem DOM/timer, usadas pelo Cronometro (client) e testadas isoladamente.
// O cronômetro conta a partir de um instante-alvo (`fimEm`, epoch ms) em vez de
// decrementar um contador a cada tick — assim ele não perde precisão quando a
// aba fica em segundo plano (o navegador atrasa/pausa `setInterval`, mas
// `Date.now()` continua correto).

// Quanto falta (em ms) até `fimEm`, nunca negativo.
export function restanteMs(fimEm, agora) {
  return Math.max(0, fimEm - agora);
}

// Formata milissegundos como "MM:SS", arredondando pra cima (nunca mostra
// 00:00 enquanto ainda falta uma fração de segundo). Negativo vira "00:00".
export function formatarMMSS(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
