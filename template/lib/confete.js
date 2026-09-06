'use client';

function coresConfete() {
  if (typeof window === 'undefined') return ['#38a0b8', '#f2b134'];
  const estilos = getComputedStyle(document.documentElement);
  const primaria = estilos.getPropertyValue('--cor-primaria').trim();
  const destaque = estilos.getPropertyValue('--cor-destaque').trim();
  return [primaria || '#38a0b8', destaque || '#f2b134'];
}

// Confete discreto e client-only (importa canvas-confetti sob demanda),
// reusado onde quer que o usuário feche um dia: tela Hoje e Protocolo.
export async function celebrar() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: coresConfete(), disableForReducedMotion: true });
}
