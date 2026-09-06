const FALLBACK = 'dev-secret-troque-em-producao-32chars';
let avisou = false;

export function segredoSessao() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET ausente ou curto — defina 32+ caracteres nas variáveis de ambiente');
  }
  if (!avisou) { console.warn('SESSION_SECRET ausente ou curto — usando segredo de desenvolvimento (não use em produção)'); avisou = true; }
  return FALLBACK;
}
