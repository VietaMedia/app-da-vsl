import { appSchema, themeSchema, identitySchema } from '../schemas';
import { moduleSchemas } from '../schemas';

function issuesParaTexto(issues) {
  return issues.map(i => i.path.join('.') + ': ' + i.message).join('; ');
}

export function validarOverride(config, key, value) {
  if (key === 'content:app') {
    const parsed = appSchema.partial().strict().safeParse(value);
    if (!parsed.success) return { ok: false, erro: issuesParaTexto(parsed.error.issues) };
    return { ok: true, value: parsed.data };
  }

  if (key === 'content:theme') {
    const parsed = themeSchema.partial().strict().safeParse(value);
    if (!parsed.success) return { ok: false, erro: issuesParaTexto(parsed.error.issues) };
    return { ok: true, value: parsed.data };
  }

  if (key === 'content:identity') {
    const parsed = identitySchema.partial().strict().safeParse(value);
    if (!parsed.success) return { ok: false, erro: issuesParaTexto(parsed.error.issues) };
    return { ok: true, value: parsed.data };
  }

  const m = /^content:module:(.+)$/.exec(key);
  if (m) {
    const moduleKey = m[1];
    const mod = config.modules.find(x => x.key === moduleKey);
    if (!mod) return { ok: false, erro: 'módulo não encontrado: ' + moduleKey };
    const result = {};
    if (value && typeof value === 'object') {
      if (value.title !== undefined) {
        if (typeof value.title !== 'string') return { ok: false, erro: 'title: precisa ser texto' };
        result.title = value.title;
      }
      if (value.subtitle !== undefined) {
        if (typeof value.subtitle !== 'string') return { ok: false, erro: 'subtitle: precisa ser texto' };
        result.subtitle = value.subtitle;
      }
      if (value.content !== undefined) {
        const schema = moduleSchemas[mod.type];
        const parsed = schema.safeParse(value.content);
        if (!parsed.success) return { ok: false, erro: issuesParaTexto(parsed.error.issues) };
        result.content = parsed.data;
      }
    }
    return { ok: true, value: result };
  }

  return { ok: false, erro: 'formato de key desconhecido: ' + key };
}
