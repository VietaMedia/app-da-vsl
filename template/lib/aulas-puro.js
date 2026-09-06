// Puras: sem banco, usadas tanto nos testes quanto em lib/dados/aulas.js.

// Estimativa de leitura: 1 palavra a cada ~180/min, arredondado, com piso de 1 min.
export function minutosDeLeitura(body) {
  const palavras = (body || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 180));
}

// Acha a primeira aula (em ordem, cruzando seções) que ainda não tem o passo
// inteiro marcado (itemIndex === -1) em `feitos`. null quando tudo concluído.
export function proximaAula(mod, feitos) {
  const concluidos = new Set((feitos || []).filter(f => f.itemIndex === -1).map(f => f.stepKey));
  for (const secao of mod.content.sections) {
    for (const passo of secao.steps) {
      if (!concluidos.has(passo.key)) {
        return { sectionKey: secao.key, stepKey: passo.key, title: passo.title, minutos: minutosDeLeitura(passo.body || '') };
      }
    }
  }
  return null;
}
