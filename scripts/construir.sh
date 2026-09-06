#!/usr/bin/env bash
# Monta o app numa cópia própria do template, testa, builda, tira as capturas e verifica.
# uso: construir.sh <pastaDoApp> <pastaDoTemplate> [porta=3010] [pin]
set -euo pipefail
APP="$1"; TEMPLATE="$2"; PORTA="${3:-3010}"; PIN="${4:-}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
REPO="$APP/repo"
[ -f "$APP/app.config.json" ] || { echo "!! falta $APP/app.config.json"; exit 1; }
echo "== 1/6 copiando template → $REPO"
mkdir -p "$REPO"
rsync -a --delete --exclude node_modules --exclude .next --exclude .git --exclude .env --exclude .superpowers "$TEMPLATE/" "$REPO/"
cp "$APP/app.config.json" "$REPO/app.config.json"
cd "$REPO"
echo "== 2/6 dependências"; npm install --silent >/dev/null 2>&1 || npm install
echo "== 3/6 ícones"; npm run icones 2>&1 | grep -v Warning | tail -1
echo "== 4/6 testes"; npx vitest run 2>&1 | grep -E "Tests |FAIL" || { echo "!! testes falharam"; exit 1; }
echo "== 5/6 build"; npm run build 2>&1 | grep -E "Compiled|rror" | head -2
# .env local só pra subir e capturar (usa o banco de dev remoto do template, se existir)
if [ -f "$TEMPLATE/.env" ]; then cp "$TEMPLATE/.env" .env; fi
if [ -n "$PIN" ]; then grep -q OWNER_PIN .env 2>/dev/null || echo "OWNER_PIN=$PIN" >> .env; fi
echo "== 6/6 capturas + verificação (porta $PORTA)"
(npx next start -p "$PORTA" > "$APP/servidor-local.log" 2>&1 &)
for i in $(seq 1 30); do curl -s -m 3 -o /dev/null "http://localhost:$PORTA/api/health" && break; sleep 1; done
rm -rf "$APP/capturas"
set +e
node "$AQUI/screenshots.mjs" "http://localhost:$PORTA" "teste-$(date +%s)@exemplo.com" "$APP/capturas" ${PIN:+--pin "$PIN"} 2>&1 | grep -E "VERIFICACAO|\| |login|overflow|rror"
RC=${PIPESTATUS[0]}
pkill -f "next start -p $PORTA" >/dev/null 2>&1
rm -f .env
if [ "$RC" -ne 0 ]; then echo "!! verificação falhou (código $RC) — veja $APP/capturas/verificacao.json"; exit 2; fi
echo "== zip"; rm -f "$APP/deploy.zip"; zip -qr "$APP/deploy.zip" . -x 'node_modules/*' '.next/*' '.env' '.env.*' '.git/*'
echo "OK: $APP/deploy.zip pronto; capturas em $APP/capturas"
