import crypto from 'node:crypto';

// Decide o que fazer quando o webhook de pagamento chama /api/acesso/liberar.
// Função pura: nenhuma chamada de rede ou banco aqui, só a regra de negócio.
export function decidirLiberacao(existente, status, ehDono = false) {
  if (ehDono) return 'protegido';
  if (status !== 'ativo' && status !== 'bloqueado') return 'invalido';
  if (existente) return 'atualizar';
  return status === 'ativo' ? 'criar' : 'ignorar';
}

// Decide o que fazer no login quando o portão (ACESSO_FECHADO) pode estar ativo.
// Função pura: nenhuma chamada de rede ou banco aqui, só a regra de negócio.
export function podeEntrar({ existente, acessoFechado }) {
  if (existente) return 'entrar';
  return acessoFechado ? 'recusar' : 'criar';
}

// Decide se o login desse e-mail precisa exigir o PIN do dono. Só se aplica
// quando OWNER_PIN está configurado e o e-mail normalizado bate com o do dono.
// Função pura: nenhuma chamada de rede ou banco aqui, só a regra de negócio.
export function exigePin({ email, ownerEmail, ownerPin }) {
  if (!ownerPin) return false;
  if (!ownerEmail) return false;
  return email === ownerEmail;
}

// Compara o PIN enviado com o PIN configurado em tempo constante (evita
// vazar por timing quantos caracteres bateram). Buffers de tamanhos
// diferentes nunca são iguais, sem cair no timingSafeEqual (que exige
// mesmo tamanho).
export function pinConfere(pin, ownerPin) {
  const a = Buffer.from(String(pin ?? ''));
  const b = Buffer.from(String(ownerPin ?? ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
