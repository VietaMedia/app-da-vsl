// Puras: sem banco, usadas tanto nos testes quanto em lib/dados/guias.js e nas
// rotas de API. `itemIndex` é sempre um índice global por guia:
// - lista: contagem sequencial cruzando as seções (0..n-1)
// - receita: índice do ingrediente (0..n-1)
// - pagina: contagem sequencial cruzando os checklists das seções (0..n-1)
// - passos, texto, audio: não têm itens marcáveis (sempre [])

export function totalItens(guide) {
  if (guide.kind === 'lista') return guide.sections.reduce((s, sec) => s + sec.items.length, 0);
  if (guide.kind === 'receita') return guide.ingredients.length;
  if (guide.kind === 'pagina') return guide.sections.reduce((s, sec) => s + (sec.checklist?.length || 0), 0);
  return 0;
}

export function indicesPorSecao(guide) {
  let i = 0;
  if (guide.kind === 'lista') return guide.sections.map(sec => sec.items.map(() => i++));
  if (guide.kind === 'pagina') return guide.sections.map(sec => (sec.checklist || []).map(() => i++));
  return [];
}

export function resumoLista(guide, marcados) {
  const marcadosSet = new Set(marcados);
  const indices = indicesPorSecao(guide);
  const porSecao = indices.map(idxs => idxs.filter(i => marcadosSet.has(i)).length);
  return {
    total: totalItens(guide),
    marcados: marcados.length,
    porSecao,
  };
}

export function estimativaTexto(guide) {
  return guide.estimate || '';
}
