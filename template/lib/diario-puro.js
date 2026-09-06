// Pura: valida o texto do diário de uma linha antes de gravar. Entre 1 e 280
// caracteres (depois de tirar espaços das pontas).
export function validarNota(text) {
  if (typeof text !== 'string') return { ok: false, erro: 'a nota deve ser um texto' };
  const texto = text.trim();
  if (texto.length < 1) return { ok: false, erro: 'escreva algo antes de guardar' };
  if (texto.length > 280) return { ok: false, erro: 'a nota pode ter no máximo 280 caracteres' };
  return { ok: true, texto };
}
