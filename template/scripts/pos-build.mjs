import fs from 'node:fs';
import path from 'node:path';

const raiz = process.cwd();
const standalone = path.join(raiz, '.next', 'standalone');

if (!fs.existsSync(standalone)) {
  console.log('pos-build: .next/standalone não existe, pulando (output não é "standalone"?)');
  process.exit(0);
}

const publicOrigem = path.join(raiz, 'public');
const publicDestino = path.join(standalone, 'public');
if (fs.existsSync(publicOrigem)) {
  fs.cpSync(publicOrigem, publicDestino, { recursive: true });
  console.log('pos-build: public/ copiado para .next/standalone/public');
}

const staticOrigem = path.join(raiz, '.next', 'static');
const staticDestino = path.join(standalone, '.next', 'static');
if (fs.existsSync(staticOrigem)) {
  fs.cpSync(staticOrigem, staticDestino, { recursive: true });
  console.log('pos-build: .next/static copiado para .next/standalone/.next/static');
}
