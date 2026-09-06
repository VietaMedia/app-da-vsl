#!/usr/bin/env bash
# Copia o template do repositorio do dono para dentro da skill, sem lixo.
# O repositorio continua a fonte da verdade; a pasta embutida e um espelho.
# uso: sincronizar-template.sh [origem]
set -euo pipefail
PADRAO="/Users/guilhermevieta/Mega Brain/Mega Brain/projetos/App da VSL/template"
ORIGEM="${1:-$PADRAO}"
SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="$SKILL/template"

[ -f "$ORIGEM/package.json" ] || { echo "!! nao achei um template em: $ORIGEM"; exit 1; }
[ -f "$ORIGEM/Dockerfile" ]  || { echo "!! o template nao tem Dockerfile - rode a Task 2 antes"; exit 1; }

if [ -d "$ORIGEM/.git" ]; then
  SUJO="$(git -C "$ORIGEM" status --porcelain | wc -l | tr -d ' ')"
  if [ "$SUJO" != "0" ]; then
    echo "!! o repositorio do template tem $SUJO arquivo(s) nao commitado(s)."
    echo "   Commite antes de sincronizar - a skill nao pode embutir rascunho."
    git -C "$ORIGEM" status --short
    exit 2
  fi
  echo "== origem: $(git -C "$ORIGEM" rev-parse --short HEAD) em $(git -C "$ORIGEM" rev-parse --abbrev-ref HEAD)"
fi

echo "== sincronizando -> $DESTINO"
mkdir -p "$DESTINO"
rsync -a --delete \
  --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  --exclude '.env' --exclude '.env.local' --exclude '.superpowers' \
  --exclude '*.log' --exclude '*.zip' --exclude 'capturas' \
  "$ORIGEM/" "$DESTINO/"

# O app.config.json de trabalho do dono nao deve viajar: cada app gera o seu.
# O exemplo, sim - a skill valida contra ele.
rm -f "$DESTINO/app.config.json"

if [ -d "$ORIGEM/.git" ]; then
  git -C "$ORIGEM" rev-parse HEAD > "$DESTINO/.origem-commit"
fi

echo "== conferindo"
for f in package.json next.config.js Dockerfile .dockerignore app.config.exemplo.json \
         prisma docs/PUBLICAR.md docs/PUBLICAR-VPS.md scripts/pos-build.mjs; do
  [ -e "$DESTINO/$f" ] || { echo "  !! FALTOU $f"; exit 3; }
  echo "  ok $f"
done
[ -e "$DESTINO/node_modules" ] && { echo "  !! node_modules vazou pro pacote"; exit 3; }
[ -e "$DESTINO/.env" ] && { echo "  !! .env vazou pro pacote"; exit 3; }
echo "== tamanho: $(du -sh "$DESTINO" | cut -f1)"
echo "OK"
