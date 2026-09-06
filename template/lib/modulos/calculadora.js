import { Parser } from 'expr-eval';
const parser = new Parser({ operators: { assignment: false, conditional: true } });
export function evaluateFormula(formula, inputs) {
  const expr = parser.parse(formula);
  for (const v of expr.variables()) if (!(v in inputs)) throw new Error(`falta o valor de "${v}"`);
  const r = expr.evaluate(inputs);
  if (typeof r !== 'number' || !Number.isFinite(r)) throw new Error('resultado inválido');
  return r;
}
export const fmt = n => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export function renderExplanation(tpl, inputs, result) {
  return tpl.replace(/\{result\}/g, fmt(result)).replace(/\{(\w+)\}/g, (_, k) => (k in inputs ? String(inputs[k]) : `{${k}}`));
}
