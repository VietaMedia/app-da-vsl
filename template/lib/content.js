import { cache } from 'react';
import { loadConfig } from './config';
import { moduleSchemas } from './schemas';
import { prisma, ensureSchema } from './db/prisma';

const memo = typeof cache === 'function' ? cache : (fn) => fn;
export function mergeOverrides(config, overrides) {
  const out = structuredClone(config);
  if (overrides['content:app']) out.app = { ...out.app, ...overrides['content:app'] };
  if (overrides['content:theme']) {
    const ot = overrides['content:theme'];
    out.theme = { ...out.theme, ...ot };
    // Cores derivadas (primaryDark de primary; surface/line de background) ficam
    // desatualizadas se só a cor-base mudar — apaga pra `derivar()` recalcular.
    if (ot.primary !== undefined && ot.primaryDark === undefined) delete out.theme.primaryDark;
    if (ot.background !== undefined) {
      if (ot.surface === undefined) delete out.theme.surface;
      if (ot.line === undefined) delete out.theme.line;
    }
  }
  if (overrides['content:identity']) {
    const oi = overrides['content:identity'];
    out.identity = {
      ...out.identity,
      ...oi,
      fonts: { ...out.identity.fonts, ...(oi.fonts || {}) },
      icon: { ...out.identity.icon, ...(oi.icon || {}) },
    };
  }
  out.modules = out.modules.map(m => {
    const o = overrides['content:module:' + m.key];
    if (!o) return m;
    const next = { ...m, ...(o.title !== undefined ? { title: o.title } : {}), ...(o.subtitle !== undefined ? { subtitle: o.subtitle } : {}) };
    if (o.content) { const p = moduleSchemas[m.type].safeParse(o.content); if (p.success) next.content = p.data; }
    return next;
  });
  return out;
}
export const getContent = memo(async function getContent() {
  const config = loadConfig();
  try {
    await ensureSchema();
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: 'content:' } } });
    const overrides = Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]));
    return mergeOverrides(config, overrides);
  } catch { return config; }
});
export async function saveOverride(key, value) {
  await ensureSchema();
  await prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(value) }, create: { key, value: JSON.stringify(value) } });
}
