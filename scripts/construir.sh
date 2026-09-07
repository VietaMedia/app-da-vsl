#!/usr/bin/env bash
# Monta o app numa cópia própria do template, testa, builda, tira as capturas e verifica.
# uso: construir.sh <pastaDoApp> <pastaDoTemplate> [porta=3010] [pin]
#
# Roda igual no Mac e no Windows (Git Bash). No Windows não existem `rsync` nem `zip`:
# o script usa o Node pra copiar e o compactador do próprio Windows pra zipar.
# Pra testar esses caminhos alternativos no Mac: SEM_RSYNC=1 SEM_ZIP=1 bash construir.sh ...
set -euo pipefail
APP="$1"; TEMPLATE="$2"; PORTA="${3:-3010}"; PIN="${4:-}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
REPO="$APP/repo"
[ -f "$APP/app.config.json" ] || { echo "!! falta $APP/app.config.json"; exit 1; }

tem_rsync() { [ -z "${SEM_RSYNC:-}" ] && command -v rsync >/dev/null; }
tem_zip()   { [ -z "${SEM_ZIP:-}" ]   && command -v zip   >/dev/null; }

# copiar_template <origem> <destino>
# Espelha a origem no destino (apagando o que sobrou de antes), sem levar node_modules,
# .next, .git, .env e .superpowers. Usa rsync quando existe; senão, o Node.
copiar_template() {
  local origem="${1%/}" destino="${2%/}"
  if tem_rsync; then
    rsync -a --delete \
      --exclude node_modules --exclude .next --exclude .git --exclude .env --exclude .superpowers \
      "$origem/" "$destino/"
  else
    node -e '
const fs = require("fs"), path = require("path");
const [origem, destino] = process.argv.slice(1);
const bloqueados = new Set(["node_modules", ".next", ".git", ".env", ".superpowers"]);
fs.rmSync(destino, { recursive: true, force: true });
fs.cpSync(origem, destino, {
  recursive: true,
  filter: (src) => !bloqueados.has(path.basename(src)),
});
' "$origem" "$destino"
  fi
}

echo "== 1/6 copiando template → $REPO"
mkdir -p "$REPO"
copiar_template "$TEMPLATE" "$REPO"
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
npx next start -p "$PORTA" > "$APP/servidor-local.log" 2>&1 &
SERVIDOR=$!
for i in $(seq 1 30); do curl -s -m 3 -o /dev/null "http://localhost:$PORTA/api/health" && break; sleep 1; done
rm -rf "$APP/capturas"
set +e
node "$AQUI/screenshots.mjs" "http://localhost:$PORTA" "teste-$(date +%s)@exemplo.com" "$APP/capturas" ${PIN:+--pin "$PIN"} 2>&1 | grep -E "VERIFICACAO|\| |login|overflow|rror"
RC=${PIPESTATUS[0]}
kill "$SERVIDOR" 2>/dev/null
command -v pkill >/dev/null && pkill -f "next start -p $PORTA" >/dev/null 2>&1
set -e
rm -f .env
if [ "$RC" -ne 0 ]; then echo "!! verificação falhou (código $RC) — veja $APP/capturas/verificacao.json"; exit 2; fi

echo "== zip"
rm -f "$APP/deploy.zip"
if tem_zip; then
  zip -qr "$APP/deploy.zip" . -x 'node_modules/*' '.next/*' '.env' '.env.*' '.git/*'
elif command -v powershell.exe >/dev/null; then
  # Windows sem `zip`: copia pra uma pasta limpa e usa o compactador do próprio Windows.
  TEMPZIP="$APP/.zip-temporario"
  copiar_template "$REPO" "$TEMPZIP"
  rm -f "$TEMPZIP"/.env "$TEMPZIP"/.env.*
  if command -v cygpath >/dev/null; then
    WIN_ORIGEM="$(cygpath -w "$TEMPZIP")"
    WIN_DESTINO="$(cygpath -w "$APP/deploy.zip")"
  else
    WIN_ORIGEM="$TEMPZIP"; WIN_DESTINO="$APP/deploy.zip"
  fi
  # aspas simples do PowerShell: um apóstrofo no caminho vira dois
  WIN_ORIGEM="${WIN_ORIGEM//\'/\'\'}"
  WIN_DESTINO="${WIN_DESTINO//\'/\'\'}"
  # -Force no Get-ChildItem é o que garante que arquivos ocultos (.dockerignore,
  # .gitignore) entrem no pacote; sem ele o Compress-Archive os deixa de fora.
  powershell.exe -NoProfile -Command "\$itens = Get-ChildItem -LiteralPath '$WIN_ORIGEM' -Force; Compress-Archive -Path \$itens.FullName -DestinationPath '$WIN_DESTINO' -Force" \
    || { echo "!! o compactador do Windows falhou"; rm -rf "$TEMPZIP"; exit 3; }
  rm -rf "$TEMPZIP"
else
  echo "!! não achei como compactar o app."
  echo "   No Mac: brew install zip"
  echo "   No Windows: o PowerShell não respondeu — feche e abra o terminal e tente de novo."
  exit 3
fi
echo "OK: $APP/deploy.zip pronto; capturas em $APP/capturas"
