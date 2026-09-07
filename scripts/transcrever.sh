#!/bin/bash
# transcrever.sh — transcreve uma VSL (vídeo local ou URL) e extrai frames pra
# análise de identidade visual.
#
# uso: transcrever.sh <video-ou-url> <pasta-saida> [--forcar]
#
# Se <video-ou-url> for uma URL, delega pro downloader da skill baixar-vsl e
# normaliza os nomes de saída. Se for um arquivo local, roda ffmpeg + whisper-cli
# diretamente.
#
# Saída em <pasta-saida>:
#   transcricao.txt, transcricao.srt, frames/ (1 por minuto, 640px), info.json

set -o pipefail

# No Windows (Git Bash) o whisper vive em %USERPROFILE%\whisper-bin, que nem sempre
# entra no PATH da sessao. Acrescentar aqui nao muda nada no Mac.
[ -d "$HOME/whisper-bin" ] && export PATH="$HOME/whisper-bin:$PATH"

ENTRADA="${1:?uso: transcrever.sh <video-ou-url> <pasta-saida> [--forcar]}"
DESTINO="${2:?uso: transcrever.sh <video-ou-url> <pasta-saida> [--forcar]}"
FORCAR=0
for a in "$@"; do [ "$a" = "--forcar" ] && FORCAR=1; done

mkdir -p "$DESTINO/frames"

if [ -f "$DESTINO/transcricao.txt" ] && [ "$FORCAR" -eq 0 ]; then
  echo "já existe transcrição em $DESTINO/transcricao.txt — use --forcar pra refazer."
  exit 0
fi

MODELO_GRANDE="$HOME/.cache/hyperframes/whisper/models/ggml-large-v3.bin"
MODELO_PEQUENO="$HOME/whisper-models/ggml-small.bin"
if [ -f "$MODELO_GRANDE" ]; then MODELO="$MODELO_GRANDE"; MODELO_NOME="large-v3"
elif [ -f "$MODELO_PEQUENO" ]; then MODELO="$MODELO_PEQUENO"; MODELO_NOME="small"
else
  echo "!! nenhum modelo de transcrição encontrado. Rode: bash checar.sh"
  exit 1
fi

# ---------- caso 1: URL ----------
if echo "$ENTRADA" | grep -qE '^https?://'; then
  VSL_SH="$HOME/.claude/skills/baixar-vsl/scripts/mac/vsl.sh"
  if [ ! -x "$VSL_SH" ]; then
    echo "!! não achei $VSL_SH (skill baixar-vsl). Instale-a antes de mandar uma URL."
    exit 1
  fi
  echo "→ baixando e transcrevendo via baixar-vsl…"
  bash "$VSL_SH" "$ENTRADA" "vsl" "$DESTINO" || { echo "!! falha ao baixar/transcrever a VSL"; exit 1; }

  PASTA_VSL="$DESTINO/vsl"
  if [ ! -d "$PASTA_VSL" ]; then
    echo "!! esperava $PASTA_VSL, não encontrei. Confira a saída do vsl.sh acima."
    exit 1
  fi

  # normaliza nomes: transcricao.md -> transcricao.txt (sem cabeçalho markdown),
  # video.* fica onde está, frames/ é copiado pra $DESTINO/frames.
  if [ -f "$PASTA_VSL/transcricao.md" ]; then
    # remove as linhas de cabeçalho (começam com # ou >) e a linha em branco após
    sed -E '/^(#|>)/d' "$PASTA_VSL/transcricao.md" | sed '/./,$!d' > "$DESTINO/transcricao.txt"
  fi
  [ -d "$PASTA_VSL/frames" ] && rsync -a "$PASTA_VSL/frames/" "$DESTINO/frames/" 2>/dev/null || cp -r "$PASTA_VSL/frames/"* "$DESTINO/frames/" 2>/dev/null

  VIDEO=$(ls "$PASTA_VSL"/video.* 2>/dev/null | head -1)
  DUR=0
  [ -n "$VIDEO" ] && DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO" 2>/dev/null | cut -d. -f1)
  IDIOMA="pt"

  N_FRAMES=$(ls "$DESTINO/frames" 2>/dev/null | wc -l | tr -d ' ')
  cat > "$DESTINO/info.json" <<EOF
{
  "idioma": "$IDIOMA",
  "duracaoSegundos": ${DUR:-0},
  "modelo": "$MODELO_NOME",
  "frames": ${N_FRAMES:-0}
}
EOF
  echo "✓ $DESTINO (via baixar-vsl)"
  exit 0
fi

# ---------- caso 2: arquivo local ----------
if [ ! -f "$ENTRADA" ]; then
  echo "!! arquivo não encontrado: $ENTRADA"
  exit 1
fi

echo "→ extraindo áudio 16k mono…"
ffmpeg -nostdin -loglevel error -y -i "$ENTRADA" -ar 16000 -ac 1 -c:a pcm_s16le "$DESTINO/audio16k.wav" \
  || { echo "!! ffmpeg falhou ao extrair o áudio"; exit 1; }

echo "→ detectando idioma (modelo: $MODELO_NOME)…"
IDIOMA=$(whisper-cli -m "$MODELO" -dl -f "$DESTINO/audio16k.wav" 2>&1 \
           | grep -oE "auto-detected language: [a-z]+" | tail -1 | awk '{print $NF}')
case "$IDIOMA" in [a-z][a-z]) ;; *) IDIOMA=pt ;; esac
echo "   idioma: $IDIOMA"

echo "→ transcrevendo (pode demorar)…"
whisper-cli -m "$MODELO" -l "$IDIOMA" -f "$DESTINO/audio16k.wav" -otxt -osrt -of "$DESTINO/transcricao" \
  || { echo "!! whisper-cli falhou"; exit 1; }

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$ENTRADA" 2>/dev/null | cut -d. -f1)

echo "→ extraindo frames (1 por minuto, 640px)…"
ffmpeg -nostdin -loglevel error -y -i "$ENTRADA" -vf "fps=1/60,scale=640:-1" "$DESTINO/frames/m%03d.jpg" \
  || echo "!! aviso: falha ao extrair frames (seguindo mesmo assim)"

rm -f "$DESTINO/audio16k.wav"

N_FRAMES=$(ls "$DESTINO/frames" 2>/dev/null | wc -l | tr -d ' ')
cat > "$DESTINO/info.json" <<EOF
{
  "idioma": "$IDIOMA",
  "duracaoSegundos": ${DUR:-0},
  "modelo": "$MODELO_NOME",
  "frames": ${N_FRAMES:-0}
}
EOF

echo "✓ $DESTINO"
echo "  transcricao.txt · transcricao.srt · frames/ ($N_FRAMES) · info.json"
