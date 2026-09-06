import { evaluateFormula, renderExplanation } from '@/lib/modulos/calculadora';

// Pura: converte texto digitado (aceita vírgula decimal) num número.
// '' ou texto não numérico → NaN.
export function paraNumero(str) {
  if (typeof str === 'number') return str;
  const s = String(str ?? '').replace(',', '.').trim();
  if (s === '') return NaN;
  return Number(s);
}

// Pura: valida um passo do assistente de avaliação guiada.
// input: { key, label, unit, default?, min?, max? } — vindo de content.inputs[] da calculadora.
// valor: string digitada no campo numérico.
export function validarPasso(input, valor) {
  const n = typeof valor === 'number' ? valor : paraNumero(valor);
  if (typeof valor === 'string' && valor.trim() === '') return { ok: false, erro: 'digite um número' };
  if (!Number.isFinite(n)) return { ok: false, erro: 'digite um número válido' };
  if (input?.min !== undefined && n < input.min) return { ok: false, erro: `o valor mínimo é ${input.min}` };
  if (input?.max !== undefined && n > input.max) return { ok: false, erro: `o valor máximo é ${input.max}` };
  return { ok: true, valor: n };
}

// Pura: calcula o resultado da avaliação a partir do módulo calculadora e dos valores coletados.
// mod: { type: 'calculadora', content: { inputs, formula, resultLabel, resultUnit, explanation, goalInput? } }
// valores: { [inputKey]: number }
export function resultadoAvaliacao(mod, valores) {
  const { formula, explanation, goalInput } = mod.content;
  let result;
  try {
    result = evaluateFormula(formula, valores);
  } catch {
    throw new Error('não foi possível calcular o resultado com os valores informados');
  }
  const texto = renderExplanation(explanation, valores, result);
  const out = { result, texto };
  if (goalInput !== undefined && valores[goalInput] !== undefined) out.goal = valores[goalInput];
  return out;
}
