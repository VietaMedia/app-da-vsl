#!/usr/bin/env bash
# Gera o zip da skill pra area de membros. Sincroniza o template antes.
# uso: empacotar.sh [pastaDeSaida]
set -euo pipefail
SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAIDA="${1:-/Users/guilhermevieta/Mega Brain/mentoria/ferramentas}"
ZIP="$SAIDA/app-da-vsl.zip"

echo "== 1/5 sincronizando o template"
bash "$SKILL/scripts/sincronizar-template.sh"

echo "== 2/5 testes da skill"
( cd "$SKILL/scripts" && node --test tests/*.test.mjs 2>&1 | tail -8 )

echo "== 3/5 conferindo o que nao pode viajar"
for proibido in scripts/node_modules template/node_modules template/.next template/.env \
                template/.git template/app.config.json; do
  [ -e "$SKILL/$proibido" ] && { echo "  !! $proibido existe e NAO pode entrar no zip"; }
done
for exigido in SKILL.md INSTALAR.md MANUAL.md template/package.json template/Dockerfile \
               scripts/detectar-destino.mjs scripts/gerar-compose.mjs \
               scripts/publicar-vps.md scripts/publicar-business.md \
               scripts/compose-borda.yml scripts/post-install-vps.sh \
               scripts/windows/instalar.ps1 scripts/windows/checar.ps1 \
               references/PADRAO-DE-QUALIDADE.md; do
  [ -e "$SKILL/$exigido" ] || { echo "  !! FALTA $exigido"; exit 1; }
done
echo "  tudo no lugar"

echo "== 4/5 zipando"
mkdir -p "$SAIDA"
rm -f "$ZIP"
( cd "$(dirname "$SKILL")" && zip -qr "$ZIP" "$(basename "$SKILL")" \
    -x '*/node_modules/*' '*/.next/*' '*/.git/*' '*/.env' '*/.env.*' \
       '*/.DS_Store' '*/.superpowers/*' '*/capturas/*' '*/RELATORIO-*.md' )

echo "== 5/5 conferindo o zip"
unzip -l "$ZIP" | grep -E "SKILL.md|INSTALAR.md|template/package.json|template/Dockerfile" || true
if unzip -l "$ZIP" | grep -qE "node_modules|\.env$"; then
  echo "!! o zip levou lixo dentro"; exit 1
fi
echo "OK: $ZIP ($(du -h "$ZIP" | cut -f1))"
