---
name: app-da-vsl
description: Transforma a VSL de qualquer oferta (link da página, vídeo ou transcrição) num aplicativo PWA completo, premium e publicado na Hostinger, com conteúdo pronto, identidade visual própria, login só por e-mail e painel do dono. Use SEMPRE que o usuário pedir "transforma essa VSL em app", "cria o app dessa VSL", "app da VSL", "quero um aplicativo pra essa oferta", "modela essa VSL como app", mandar um link de VSL/página de vendas pedindo um app, ou pedir pra "instalar/configurar a skill do app". Funciona pra qualquer nicho e idioma; nunca para pra pedir aprovação no meio — entrega pronto e publicado.
---

# App da VSL

Você recebe uma VSL e entrega um aplicativo no ar. **Sem parar pra aprovar mockup, briefing ou
identidade.** O usuário só opina depois de abrir o link no celular. Quem usa isto geralmente é um
mentorado não técnico: você executa tudo, ele não roda comando nenhum; explique o que aconteceu
em português simples e nunca cole erro cru.

A autoridade de qualidade é `references/PADRAO-DE-QUALIDADE.md`. Leia inteiro antes de começar
qualquer app. O que está lá não é sugestão: é o nível mínimo.

## O que você entrega

Uma pasta `apps/<slug>/` com `01-analise.md`, `02-briefing.md`, `app.config.json`, capturas de tela,
`03-entrega.md` — e o app publicado num endereço `*.hostingersite.com` (site e banco novos),
com painel do dono, PIN do dono, e o texto pronto pra colar na página de obrigado.

## Antes de tudo: `checar`

```bash
bash ~/.claude/skills/app-da-vsl/scripts/checar.sh
```

Se faltar algo, diga o que é e o que vai acontecer ("falta o programa que transcreve o vídeo;
leva 5 minutos e é uma vez só") e instale você mesmo com o comando que o `checar.sh` imprime.
Só o Homebrew e o login do GitHub (`gh auth login`) o usuário precisa fazer na própria
tela; guie passo a passo. A Hostinger precisa estar conectada como MCP nesta sessão — para
publicar no plano de hospedagem, as ferramentas `hosting_*`; para publicar numa VPS,
também as `VPS_*` e as `DNS_*`. Se não estiver, explique que é o conector da Hostinger no
Claude Code e onde ele liga.

Na primeira vez, prepare as ferramentas da skill: `cd ~/.claude/skills/app-da-vsl/scripts && npm install`.

## Onde fica o template

O app nasce de um template pronto (Next.js) que **vem dentro da própria skill**. Ordem de
busca:
1. Variável `APP_DA_VSL_TEMPLATE` apontando pra uma pasta local (para o dono desenvolver).
2. `~/.claude/skills/app-da-vsl/template/` — **o normal**. É o que o mentorado tem.
3. `gh repo clone VietaMedia/app-da-vsl-template <pasta>` — só se as duas primeiras
   faltarem e o usuário tiver acesso ao repositório privado.

O repositório do GitHub continua sendo a fonte da verdade. A pasta embutida é um espelho,
atualizado pelo dono com
`bash ~/.claude/skills/app-da-vsl/scripts/sincronizar-template.sh` antes de gerar o zip.
O mentorado nunca roda isso.

Nunca edite o template pra um app específico. Tudo que muda entre apps está em
`app.config.json` e nos ícones gerados. Se o app precisa de algo que o template não tem,
use a regra de fallback (PADRÃO §9) e registre a lacuna no `03-entrega.md`.

## O fluxo (dez passos, um portão só)

Trabalhe numa pasta do usuário (`~/Downloads/app-da-vsl/` se ele não disser outra). Cada passo
grava seu arquivo em `apps/<slug>/` antes de seguir; se a sessão cair, retome do último arquivo.

### 1. Transcrever
```bash
bash ~/.claude/skills/app-da-vsl/scripts/transcrever.sh "<link ou arquivo>" apps/<slug>/fonte
```
Sai `transcricao.txt`, `transcricao.srt`, `frames/` (um por minuto) e `info.json` com o idioma.
Se já veio uma transcrição em texto, salve como `transcricao.txt` e pule. **O idioma da VSL é o
idioma do app inteiro**: grave `app.locale` (`pt`, `es` ou `en`) no config — isso troca os rótulos de sistema (abas, botões, tela de entrar) — e escreva todo o conteúdo nesse idioma. Sem `locale`, o app sai em português mesmo com conteúdo em espanhol.

### 2. Analisar por promessa → `01-analise.md`
Use `references/analise-template.md`. Leia a transcrição inteira (em páginas, se for longa) e olhe
4-6 frames espalhados. Extraia: mecanismo (problema-raiz, causa, vilão, mecanismo único, prova,
regra de ouro), oferta (produto, preço, garantia, bônus, escassez), público, tipo (info/nutra/
físico/serviço) e **as seis famílias de entrega** (PADRÃO §9): plano no tempo, conhecimento,
ferramentas, medição, personalização, motivação. Pra cada família: o que a VSL promete e qual
bloco do template entrega. Marque o que a VSL **não revela** (receita secreta, planilha…) — isso
será gerado por você com fontes públicas, nunca inventado como se fosse o original.

### 3. Identidade → seção do `02-briefing.md`
Ordem de prioridade (PADRÃO §3.1):
1. Marca existente (cores da página de vendas, logo, embalagem no vídeo).
2. Cores dos frames: `node ~/.claude/skills/app-da-vsl/scripts/extrair-cores.mjs apps/<slug>/fonte/frames --json`.
3. `scripts/banco-por-mercado.json`: escolha a família pelo mercado (as `palavrasChave` ajudam) e
   use como base e como validador do que veio de 1 e 2.
Regra de decisão: se `extrair-cores` devolver `acento: null` ou uma primária com croma baixo
(`okC < 0.08`, o normal em VSL de rosto falando), **os frames são só dica** e a paleta vem inteira
do banco por mercado; use os frames pra escolher ENTRE famílias parecidas (cenário de mato → natural;
consultório → clínico). Só quando os frames trazem cor forte e coerente (produto, cenário, marca)
ela entra como primária/acento. Monte `theme` e `identity` e valide:
`node ~/.claude/skills/app-da-vsl/scripts/contraste.mjs '<theme json>'` (ele devolve o tema
corrigido; use o corrigido). Símbolo pelo mecanismo, não pelo nicho. Anote a origem de cada decisão.

### 4. Briefing → `02-briefing.md`
Use `references/briefing-template.md`: nome (o da oferta), slogan (a promessa em 5 palavras, sem
número de resultado), descrição, módulos escolhidos (2 a 8) com chave/tipo/papel, estrutura do
protocolo (fases, temas semanais, total de dias), sumário das aulas, lista de guias, métrica,
contador, lembretes, avaliação (calculadora e/ou quiz), textos do sistema, e a seção "Fontes".
O briefing é interno: **não mostre nem peça aprovação.**

### 5. Conteúdo completo → `app.config.json`
Siga `references/brief-de-conteudo.md` à risca (faixas mínimas, regras de segurança por área,
voz, idioma). Escreva um gerador `apps/<slug>/scripts/gerar-config.mjs` modular (constantes por
seção) que grava `apps/<slug>/app.config.json`, e valide:
```bash
node ~/.claude/skills/app-da-vsl/scripts/validar-config.mjs apps/<slug>/app.config.json <template>
```
Conteúdo grande (aulas, receitas, guias) você pode escrever em lotes; se usar um agente pra gerar,
entregue a ele o `brief-de-conteudo.md` inteiro e as regras do PADRÃO §7, e revise amostras.

### 6. Construir
```bash
cp apps/<slug>/app.config.json <template>/app.config.json
cd <template> && npm install && npm run icones && npm test && npm run build
```
Tudo verde. Se um teste quebrar por causa do config, o config está errado: corrija o config.
Depois crie o repositório do usuário: copie o template pra `apps/<slug>/repo/` (sem `node_modules`,
`.next`, `.git`, `.env`), `git init`, commit, `gh repo create <slug>-app --private --source=. --push`.

### 7. Escolher onde publicar

Antes de olhar as capturas, descubra o destino. Chame as duas ferramentas MCP e salve as
respostas cruas:

- `hosting_listWebsitesV1` → grave em `apps/<slug>/destino/sites.json`
- `VPS_getVirtualMachinesV1` (sem parâmetros) → grave em `apps/<slug>/destino/vms.json`

Depois:

```bash
node ~/.claude/skills/app-da-vsl/scripts/detectar-destino.mjs \
  apps/<slug>/destino/sites.json apps/<slug>/destino/vms.json \
  > apps/<slug>/destino/destino.json
cat apps/<slug>/destino/destino.json
```

- `recomendacao: "business"` → siga o **Ramo A**. Não pergunte nada.
- `recomendacao: "vps"` → siga o **Ramo B**. Não pergunte nada.
- `recomendacao: "perguntar"` → faça a pergunta do campo `frase`, uma vez, e siga o que ele
  responder. Essa é a única pergunta de infraestrutura que a skill faz.
- `recomendacao: "nenhum"` → pare. Explique que a conta da Hostinger não tem nem plano de
  hospedagem nem VPS ligada, e que ele precisa contratar um dos dois. **Não compre nada.**

### 8. Ver com os próprios olhos

Suba local (`npx next start -p 3005` depois do build; `.env` local com um `DATABASE_URL`
válido) e rode:

```bash
node ~/.claude/skills/app-da-vsl/scripts/screenshots.mjs <baseUrl> teste-<slug>@exemplo.com apps/<slug>/capturas --pin <PIN>
```

Abra as capturas (leia as imagens) e compare com o PADRÃO §4-§6. O script termina com
`VERIFICACAO: OK` ou uma lista de falhas. **Não entregue com falha.** Olhe 360 e 430 px.
Dígitos, cartões com margem, nada encostado na borda, botões inteiros, nenhum texto de
venda, nenhum aviso de senha/prazo.

### 9. Publicar — Ramo A (plano Business)

Siga `scripts/publicar-business.md`. Resumo: subdomínio grátis → site → banco → variáveis
(`DATABASE_URL` com **localhost**, `SESSION_SECRET` 48 hex, `OWNER_EMAIL`, `OWNER_PIN` 6
dígitos, `ACCESS_TOKEN`; **nunca `NODE_ENV`**) → zip sem `node_modules/.next/.env/.git` →
`hosting_deployJsApplication` → esperar `completed` → `smoke.sh` → abas com sessão.

### 9. Publicar — Ramo B (VPS)

Siga `scripts/publicar-vps.md`. Resumo: preparar a VPS uma vez (se ainda não estiver) →
garantir que o repositório privado do app está no GitHub (`gh repo create <slug>-app
--private --source=. --push`) → escolher o endereço (subdomínio do domínio dele, ou
`sslip.io` só pra espiar) → gerar o compose com `gerar-compose.mjs` →
`VPS_createNewProjectV1` → esperar os containers subirem → `smoke.sh`.

Nos dois ramos, guarde tudo em `apps/<slug>/publicacao.json` (sem senha de banco em texto
claro no `03-entrega.md`).

### 10. Entregar → `03-entrega.md`
Use `references/entrega-template.md`: link do app, link do painel, e-mail e PIN do dono, texto
pra colar na página de obrigado (no idioma da VSL), roteiro de teste de 5 minutos, o que tem
dentro, o que é exemplo (links de vídeo, materiais do expert), lacunas registradas, como fechar o
portão depois (webhook + `ACESSO_FECHADO`), e "como funciona por dentro" em linguagem simples.
Termine a conversa com a tabela de pendências do usuário (o quê, onde, importância, tempo).

## Regras que não se negociam

- Copy de venda não entra no app (comparações, números de resultado, medo). O app é entrega.
- Nada de PDF, nada de "em breve", nada de aba vazia, nada de placeholder.
- Tela de entrar: só a frase do e-mail da compra, o campo e o botão. Nenhum aviso de senha ou prazo.
- Conteúdo de saúde, dinheiro, fé, relacionamento: seguro, com fontes públicas, sem prescrever,
  sem prometer, sem contrariar orientação profissional. Aviso de saúde em apps de saúde (`app.notice`).
- Nomes que a VSL usa ("IA", "método X", "protocolo Y") ficam na interface: é o que o comprador reconhece.
- Se algo não cabe no template, fallback (PADRÃO §9) e lacuna registrada. Nunca "não dá".
- Mecanismo que não deve ser replicado (sinais financeiros, apostas, cura, adulto): PADRÃO §9.1 — o
  equivalente legítimo mais próximo, ou não elegível (adulto/aposta), sempre explicado no 03-entrega.
- Não pare pra perguntar o que você consegue decidir. Pergunte só o que só o usuário sabe: o e-mail
  do dono (se não estiver na conversa) e, se houver mais de uma VSL, qual.

## Se algo der errado

- Build da Hostinger falhou: `hosting_getNodeJSBuildLogsV1`; causas comuns em `scripts/publicar-business.md`.
- Banco recusa conexão: host tem que ser `localhost` em produção; em dev, IPv4 do servidor.
- Capturas com falha de verificação: corrija e rode de novo; três rodadas no máximo antes de
  registrar como lacuna do template.
- Transcrição vazia ou em idioma errado: rode `transcrever.sh` com `--forcar` e confira `info.json`.
- App na VPS não sobe: `VPS_getProjectLogsV1` (últimas 300 linhas de todos os serviços) e
  `VPS_getProjectContainersV1` (status e health de cada container).
- HTTPS não aparece: o DNS ainda não propagou. Confira que o A record aponta pro IP da VPS
  e espere; o Caddy tenta de novo sozinho. Nunca reinstale a VPS por causa disso.

## Referências
`references/PADRAO-DE-QUALIDADE.md` · `analise-template.md` · `briefing-template.md` ·
`brief-de-conteudo.md` · `entrega-template.md` · `hostinger-mcp.md` · `scripts/publicar-business.md` ·
`scripts/publicar-vps.md` · `MANUAL.md` (pro mentorado)
