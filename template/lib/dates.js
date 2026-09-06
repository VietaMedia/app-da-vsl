export function hojeISO(tz = 'America/Sao_Paulo', d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

// Mapa de app.locale ('pt'/'es'/'en') pro locale que o Intl entende.
const INTL_LOCALES = { pt: 'pt-BR', es: 'es-ES', en: 'en-US' };
export function localeIntl(locale = 'pt') {
  return INTL_LOCALES[locale] || INTL_LOCALES.pt;
}

// Pura: "Quinta-feira, 5 de setembro" (ou equivalente no locale) a partir de
// um dia ISO (YYYY-MM-DD).
export function dataFormatadaPara(hoje, locale = 'pt') {
  const d = new Date(hoje + 'T00:00:00');
  const formatado = new Intl.DateTimeFormat(localeIntl(locale), { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  return formatado.charAt(0).toUpperCase() + formatado.slice(1);
}
export function diasEntre(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
export function addDias(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

export function validarData(date, hoje) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [ano, mes, dia] = date.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return false;
  if (date > hoje) return false;
  return true;
}
