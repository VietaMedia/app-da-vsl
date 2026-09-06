#!/bin/bash
# checar.sh — confere se a máquina tem tudo que a skill app-da-vsl precisa.
# Não instala nada sozinho: só diz o que falta e o comando pra resolver.
# uso: bash checar.sh

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FALTA=0
ESSENCIAL_FALTOU=0

ok()   { echo "  ✓ $1"; }
falta(){ echo "  ✗ $1"; echo "      instale com: $2"; FALTA=1; if [ "${3:-essencial}" = "essencial" ]; then ESSENCIAL_FALTOU=1; fi; }

echo "Conferindo as ferramentas da skill app-da-vsl:"
echo

# node >= 20
if command -v node >/dev/null; then
  NODE_MAJOR="$(node -e 'console.log(process.versions.node.split(".")[0])')"
  if [ "$NODE_MAJOR" -ge 20 ] 2>/dev/null; then
    ok "node $(node -v) (≥ 20)"
  else
    falta "node ($(node -v), precisa ≥ 20)" "brew install node"
  fi
else
  falta "node" "brew install node"
fi

if command -v npm >/dev/null; then ok "npm $(npm -v)"
else falta "npm" "brew install node"; fi

if command -v gh >/dev/null; then
  if gh auth status >/dev/null 2>&1; then
    ok "gh (GitHub CLI) autenticado"
  else
    falta "gh autenticado" "gh auth login" "opcional"
  fi
else
  falta "gh (GitHub CLI)" "brew install gh"
fi

if command -v ffmpeg >/dev/null; then ok "ffmpeg (áudio e frames)"
else falta "ffmpeg" "brew install ffmpeg"; fi

if command -v whisper-cli >/dev/null; then
  ok "whisper-cli (transcrição)"
else
  falta "whisper-cli" "brew install whisper-cpp"
fi

MODELO_GRANDE="$HOME/.cache/hyperframes/whisper/models/ggml-large-v3.bin"
MODELO_PEQUENO="$HOME/whisper-models/ggml-small.bin"
if [ -f "$MODELO_GRANDE" ]; then
  ok "modelo de transcrição (large-v3, o melhor)"
elif [ -f "$MODELO_PEQUENO" ]; then
  ok "modelo de transcrição (small — funciona, large-v3 seria melhor)"
else
  falta "modelo de transcrição" \
    "mkdir -p ~/whisper-models && curl -L -o ~/whisper-models/ggml-small.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin"
fi

if command -v zip >/dev/null; then ok "zip (empacotar o projeto pra publicar)"
else falta "zip" "brew install zip"; fi

echo
echo "  → checando o Playwright (screenshots)…"
if npx --yes playwright --version >/dev/null 2>&1; then
  ok "playwright ($(npx --yes playwright --version 2>/dev/null))"
else
  falta "playwright" "cd \"$AQUI\" && npm install"
fi

if [ -d "/Applications/Google Chrome.app" ]; then
  ok "Google Chrome instalado"
else
  falta "Google Chrome" "brew install --cask google-chrome"
fi

echo
echo "  → checando as dependências Node da própria skill (sharp)…"
if [ -d "$AQUI/node_modules/sharp" ]; then
  ok "dependências da skill instaladas (sharp, playwright)"
else
  falta "dependências da skill (sharp, playwright)" "cd \"$AQUI\" && npm install"
fi

echo
if [ "$FALTA" -eq 0 ]; then
  echo "Tudo pronto."
  exit 0
elif [ "$ESSENCIAL_FALTOU" -eq 0 ]; then
  echo "Faltam só itens opcionais — pode seguir."
  exit 0
else
  echo "Falta coisa essencial. Resolva os itens marcados com ✗ acima e rode de novo."
  exit 1
fi
