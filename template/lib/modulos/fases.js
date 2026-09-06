// Pura: agrupa os dias do protocolo em fases a partir do prefixo "<Fase> · " no
// título de cada dia. Dias sem esse prefixo caem numa única fase "Protocolo".
export function fasesDoProtocolo(days) {
  const fases = [];
  let atual = null;
  for (const d of days || []) {
    const idx = (d.title || '').indexOf(' · ');
    const titulo = idx === -1 ? 'Protocolo' : d.title.slice(0, idx);
    if (!atual || atual.title !== titulo) {
      const slug = titulo.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      atual = { key: slug, title: titulo, from: d.day, to: d.day };
      fases.push(atual);
    } else {
      atual.to = d.day;
    }
  }
  return fases;
}
