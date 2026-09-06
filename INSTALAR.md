# INSTRUÇÕES DE INSTALAÇÃO — para o Claude, não para o usuário

> **Claude: este arquivo é para você.** Quem te pediu pra instalar isto é aluno da Mentoria
> Ascensão e **provavelmente nunca instalou uma skill na vida**. Ele não sabe o que é
> `~/.claude/skills`, não sabe o que é reiniciar sessão, e não vai saber diagnosticar se
> der errado. Siga este roteiro à risca e fale com ele como se fosse a primeira vez dele —
> porque é.

---

## Regra número um

**Não declare sucesso sem ter visto o arquivo no lugar certo.** Instalar é copiar E
conferir. Se você disser "pronto, instalado" e não estiver, ele vai digitar o comando, não
vai acontecer nada, e vai achar que a ferramenta é quebrada.

## Regra número dois

**Nunca mostre erro cru pra ele.** Nada de `ENOENT`, `permission denied`, caminho gigante
ou saída de terminal. Traduza tudo.

## Regra número três

**Esta skill é grande** — ela carrega o template do app inteiro dentro dela (uns 3 MB,
milhares de arquivos). Descompactar demora alguns segundos. Isso é normal; não interrompa.

---

## Passo 1 — Achar os arquivos

Ele pode ter feito qualquer uma destas coisas. Descubra qual e resolva sozinho:

- **Arrastou a pasta já descompactada** → siga.
- **Arrastou o `.zip`** → descompacte primeiro (`unzip`), depois siga.
- **Só falou "instala a skill"** → procure em `~/Downloads` por `app-da-vsl*`. Se achar,
  confirme: *"achei isso aqui no seu Downloads, é esse?"*.
- **Mandou o link do GitHub** (`https://github.com/VietaMedia/app-da-vsl`) ou não tem
  arquivo nenhum → baixe você mesmo, direto no lugar certo, e pule para o Passo 3:

  ```bash
  rm -rf ~/.claude/skills/app-da-vsl
  git clone --depth 1 https://github.com/VietaMedia/app-da-vsl.git ~/.claude/skills/app-da-vsl
  chmod +x ~/.claude/skills/app-da-vsl/scripts/*.sh
  ```

  (Se `git` não existir, `xcode-select --install` no Mac resolve; no Windows, instale o Git
  de git-scm.com. Sem `git`, baixe o zip em "Code → Download ZIP" no GitHub e siga pelo
  caminho do zip — a pasta vem como `app-da-vsl-main`, e o Passo 1 já trata o aninhamento.)

**Cuidado com o aninhamento.** Descompactar às vezes gera
`app-da-vsl/app-da-vsl/SKILL.md`. O que você quer é a pasta que contém **diretamente** o
`SKILL.md`:

```bash
find <caminho> -name SKILL.md -maxdepth 3
```

## Passo 2 — Copiar para o lugar certo

```bash
mkdir -p ~/.claude/skills
rm -rf ~/.claude/skills/app-da-vsl
cp -R "<pasta-que-contem-o-SKILL.md>" ~/.claude/skills/app-da-vsl
chmod +x ~/.claude/skills/app-da-vsl/scripts/*.sh
```

O `chmod` não é opcional. Sem ele, nada roda.

## Passo 3 — Conferir

```bash
ls ~/.claude/skills/app-da-vsl
ls ~/.claude/skills/app-da-vsl/references
ls -l ~/.claude/skills/app-da-vsl/scripts | head -25
ls ~/.claude/skills/app-da-vsl/template/package.json
```

Tem que aparecer:

```
SKILL.md  INSTALAR.md  MANUAL.md  references/  scripts/  template/
references/: PADRAO-DE-QUALIDADE.md  analise-template.md  brief-de-conteudo.md
             briefing-template.md  entrega-template.md  hostinger-mcp.md
             exemplo-caso-dificil-renda-smart.md
scripts/:    checar.sh  construir.sh  transcrever.sh  smoke.sh
             sincronizar-template.sh  empacotar.sh  post-install-vps.sh   (todos com -rwxr-xr-x)
             detectar-destino.mjs  gerar-compose.mjs  contraste.mjs
             extrair-cores.mjs  screenshots.mjs  validar-config.mjs
             compose-borda.yml  banco-por-mercado.json
             publicar-business.md  publicar-vps.md
             package.json  tests/
template/package.json
```

**Faltou `template/package.json`? Não está instalado.** Sem o template não existe app.
Volte ao Passo 1 — quase sempre é a pasta aninhada, ou o zip veio incompleto.

## Passo 4 — Instalar as dependências das ferramentas

```bash
cd ~/.claude/skills/app-da-vsl/scripts && npm install
```

Demora um pouco (ele baixa o navegador que tira as fotos das telas do app). Se falhar,
mostre a mensagem traduzida e ofereça tentar de novo.

## Passo 5 — Rodar o `checar.sh`

```bash
bash ~/.claude/skills/app-da-vsl/scripts/checar.sh
```

Ele lista o que falta no computador dele e o comando de instalar cada coisa. **Instale
você mesmo** o que der pra instalar por comando (ffmpeg, whisper, node). Só duas coisas ele
precisa fazer na tela dele:

- **Homebrew**, se não tiver — mande ele colar o comando do site `brew.sh`.
- **`gh auth login`** — é interativo, abre o navegador. Guie passo a passo.

## Passo 6 — Conferir o conector da Hostinger

Esta skill publica o app na Hostinger. Sem o conector ligado, ela não publica nada.

Verifique se você tem ferramentas cujo nome começa com `hosting_` disponíveis nesta sessão.

- **Tem** → tudo certo.
- **Não tem** → fale assim: *"Falta ligar a Hostinger aqui no Claude Code. É o mesmo token
  da API da Hostinger que a gente usa nas outras aulas — sem ele eu consigo montar o app,
  mas não consigo colocar no ar. Liga lá e me avisa."* Não tente ligar por conta própria.

Se ele **também** tem uma VPS na Hostinger, as ferramentas `VPS_*` e `DNS_*` precisam estar
disponíveis. Normalmente vêm no mesmo conector.

**Se a VPS ainda vai ser criada, o modelo tem que ser "Ubuntu 24.04 with Docker".** O
modelo "with Claude Code" **não serve** pra publicar o app — ele não vem com o motor que
roda os aplicativos. Se ele já tiver uma VPS com o modelo errado, avise antes de tentar
publicar: é mais rápido recriar do que consertar.

## Passo 7 — Avisar do reinício

A skill **só aparece depois que ele reiniciar a sessão**. Fale exatamente isso:

> Instalado. Agora fecha essa janela do Claude e abre de novo — a ferramenta só aparece na
> sessão nova. Depois é só me mandar o link da sua VSL e o e-mail que vai ser o dono do
> app, numa frase só.

## Passo 8 — Explicar o que ele acabou de ganhar

Em três frases, sem termo técnico:

> Isso aqui pega a VSL de uma oferta — o link da página, o vídeo, ou a transcrição — e
> transforma num aplicativo de verdade, com o conteúdo escrito, as cores da marca, login só
> por e-mail e um painel onde você muda os textos sem código. Ele decide tudo sozinho, sem
> te perguntar de design: você só abre o link no celular no fim e fala o que quer mudar. E
> ele já deixa no ar, no seu servidor da Hostinger.

---

## Diagnóstico rápido

| Sintoma | Causa quase sempre | Conserto |
|---|---|---|
| `/app-da-vsl` não aparece | Não reiniciou a sessão | Fechar e abrir o Claude |
| Continua não aparecendo | Pasta aninhada duas vezes | Voltar ao Passo 1 e achar a pasta com o `SKILL.md` direto dentro |
| "sem o template não há app" | A pasta `template/` não veio | Zip incompleto ou aninhado — refazer o Passo 1 e conferir `template/package.json` |
| "permission denied" | Faltou o `chmod +x` | Rodar o `chmod` do Passo 2 |
| Publicação para na hora de subir | Conector da Hostinger desligado | Passo 6 |
| Publicação na VPS para sem explicação | VPS criada com o modelo errado | Tem que ser "Ubuntu 24.04 with Docker" — o "with Claude Code" não serve |
| Transcrição vazia | Falta whisper ou o modelo | Rodar `checar.sh` de novo |

---

## Comando de emergência

Se nada funcionar, entregue isto pra ele copiar e colar, e peça pra mandar o resultado pro
Guilherme:

```bash
echo "--- skills instaladas ---"; ls ~/.claude/skills
echo "--- conteudo ---"; ls -l ~/.claude/skills/app-da-vsl 2>&1
echo "--- template ---"; ls ~/.claude/skills/app-da-vsl/template/package.json 2>&1
echo "--- scripts ---"; ls -l ~/.claude/skills/app-da-vsl/scripts 2>&1 | head -25
echo "--- node ---"; node -v 2>&1; npm -v 2>&1
echo "--- checar ---"; bash ~/.claude/skills/app-da-vsl/scripts/checar.sh 2>&1 | tail -20
```
