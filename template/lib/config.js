import fs from 'node:fs';
import path from 'node:path';
import { configSchema } from './schemas';
let cache = null;

export function parseConfigText(text) {
  let raw;
  try { raw = JSON.parse(text); }
  catch (e) { throw new Error('app.config.json: JSON inválido (' + e.message + ')'); }
  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.path.join('.') + ' — ' + i.message).join('; ');
    throw new Error('app.config.json: ' + msg);
  }
  return parsed.data;
}

export function loadConfig() {
  if (cache) return cache;
  let text;
  try { text = fs.readFileSync(path.join(process.cwd(), 'app.config.json'), 'utf8'); }
  catch { throw new Error('app.config.json não encontrado na raiz do projeto'); }
  cache = parseConfigText(text);
  return cache;
}
