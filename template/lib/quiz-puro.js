// Puras: sem banco, usadas tanto nos testes quanto no Assistente (client) e na
// tela /app/eu (server). quiz: { questions: [{key, text, options:[{key, label,
// points:{perfilKey:n}}]}], profiles: [{key, title, description, ajustes}] }.

// Soma os pontos de cada resposta e devolve o perfil vencedor.
// respostas: { [qKey]: optKey }. Empate: vence o primeiro perfil na ordem de `profiles`.
export function calcularPerfil(quiz, respostas) {
  const pontos = {};
  for (const perfil of quiz.profiles) pontos[perfil.key] = 0;

  for (const q of quiz.questions) {
    const optKey = respostas?.[q.key];
    const opt = q.options.find(o => o.key === optKey);
    if (!opt) continue;
    for (const [perfilKey, n] of Object.entries(opt.points || {})) {
      if (perfilKey in pontos) pontos[perfilKey] += n;
    }
  }

  let melhor = quiz.profiles[0].key;
  for (const perfil of quiz.profiles) {
    if (pontos[perfil.key] > pontos[melhor]) melhor = perfil.key;
  }
  return { perfilKey: melhor, pontos };
}

// Verifica se toda pergunta do quiz foi respondida com uma opção válida.
export function validarRespostas(quiz, respostas) {
  if (!respostas || typeof respostas !== 'object') return false;
  return quiz.questions.every(q => q.options.some(o => o.key === respostas[q.key]));
}

// Acha o perfil de quiz atual de um usuário: perfil.answers.perfil precisa
// corresponder a um perfil de algum módulo quiz do content. Usada tanto na
// tela /app/eu (cartão "Seu perfil") quanto em /app/eu/perfil (ajustes).
export function perfilAtual(content, perfil) {
  const perfilKey = perfil?.answers?.perfil;
  if (!perfilKey) return null;
  const modulosQuiz = (content?.modules || []).filter(m => m.type === 'quiz');
  for (const mod of modulosQuiz) {
    const profile = mod.content.profiles.find(p => p.key === perfilKey);
    if (profile) return { quizKey: mod.key, profile };
  }
  return null;
}
