// Utilidades comuns às rotas de API: ler o corpo JSON com erro amigável e
// responder erros inesperados sem vazar detalhes internos (mensagem de
// exceção, stack, etc.) pro cliente.

// Lê e faz parse do corpo JSON do request. Em corpo ausente/malformado,
// lança a própria Response 400 — o padrão de rota (`catch (e) { return e
// instanceof Response ? e : ... }`) já sabe devolver isso direto.
export async function lerJson(req) {
  try {
    return await req.json();
  } catch {
    throw Response.json({ error: 'corpo inválido' }, { status: 400 });
  }
}

// Loga o erro real no servidor e devolve uma mensagem genérica ao cliente —
// nunca `e.message`, que pode vazar detalhes internos (caminho de arquivo,
// erro de driver do banco, etc.).
export function erroInterno(e) {
  console.error(e);
  return Response.json({ error: 'erro interno' }, { status: 500 });
}
