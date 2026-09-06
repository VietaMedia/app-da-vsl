const registros = new Map();

export function permitir(chave, { max = 10, janelaMs = 600000, agora = Date.now() } = {}) {
  const limite = agora - janelaMs;
  const tentativas = (registros.get(chave) || []).filter(t => t > limite);
  if (tentativas.length >= max) { registros.set(chave, tentativas); return false; }
  tentativas.push(agora);
  registros.set(chave, tentativas);
  return true;
}

export function chaveDoRequest(req, prefixo) {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : 'local';
  return prefixo + ':' + ip;
}
