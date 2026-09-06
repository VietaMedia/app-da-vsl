# Como funciona o app

Este documento explica o app em linguagem simples, sem jargão técnico. Se você não é
programador, é para você.

## O que é cada pasta

Você provavelmente nunca vai precisar mexer nessas pastas diretamente (para trocar textos,
use o painel — veja abaixo), mas é bom saber o que é o quê:

- `app/`: as telas do site (a página de entrar, a área do app, o painel do dono).
- `components/`: pedacinhos de tela reutilizados (botões, cartões, menus).
- `lib/`: as regras do sistema por trás das telas (login, banco de dados, cálculo dos
  módulos).
- `prisma/`: a "planta" do banco de dados — quais tabelas existem e o que cada uma guarda.
- `public/`: arquivos servidos direto (ícones do app, o "manifesto" que deixa o site
  instalável no celular como um app).
- `scripts/`: scripts auxiliares, como o `smoke.sh` (teste rápido depois de publicar) e o
  gerador de ícones.
- `docs/`: esta documentação.
- `app.config.json`: o conteúdo do produto (nome do app, cores, módulos, textos das aulas).
  É esse arquivo que a skill de configuração (`/app-da-vsl`) troca para gerar uma versão nova
  do app para outro nicho.

## Onde mudar textos (sem mexer em código)

Não edite arquivos para trocar um texto do dia a dia. Faça login como dono e vá em
**Painel → Conteúdo**. Lá dá para sobrescrever o título, o subtítulo e o conteúdo de cada
módulo sem tocar em nenhum arquivo — as alterações ficam guardadas no banco de dados e têm
prioridade sobre o que está no `app.config.json`.

(Detalhe técnico: cada salvamento em `PUT /api/painel/conteudo` substitui o valor inteiro
daquela chave de conteúdo, não faz uma mescla parcial — então salvar de novo sempre grava a
versão completa mais recente.)

Mudanças estruturais (adicionar um módulo novo) são feitas editando `app.config.json` — isso
normalmente é trabalho da skill `/app-da-vsl`, não do dia a dia do mentor.

## Idioma do app

O campo `app.locale` no `app.config.json` define o idioma dos rótulos de sistema do app —
botões, abas, mensagens de erro, saudações, aria-labels — e aceita `"pt"`, `"es"` ou `"en"`
(padrão `"pt"` quando ausente). O conteúdo de cada módulo (dias do protocolo, aulas, guias,
textos do quiz etc.) continua vindo do `app.config.json` no idioma em que a VSL foi escrita —
trocar `app.locale` não traduz esse conteúdo, só o "chrome" que o app fala por conta própria
(inclusive datas e a barra de abas). O **Painel do dono** (`/painel`) fica sempre em português,
independentemente de `app.locale` — é uma ferramenta interna, não faz parte da experiência do
comprador.

## Onde mudar cores e identidade (também no painel)

Em **Painel → Conteúdo** também tem duas seções no topo:

- **Aparência**: três seletores de cor (primária, destaque, fundo) com uma prévia ao vivo.
  Salvar aplica na hora em todo o app — inclusive na tela de "entrar".
- **Identidade**: escolha do "clima" do app (o tom geral — caloroso, clínico, energético
  etc.), do símbolo (mostrado como uma grade de ícones) e da ilustração de fundo usada nos
  cabeçalhos.

**Ícone instalado precisa de rebuild.** Trocar o símbolo aqui muda o ícone dentro do app na
hora, mas o ícone que fica salvo na tela inicial do celular (o "ícone instalado" do PWA) é
gerado uma vez, no momento de publicar. Pra esse ícone acompanhar a troca, é preciso rodar
`npm run icones` de novo e publicar — normalmente um passo da skill `/app-da-vsl`, não algo
que o mentor faz sozinho pelo painel. **O manifesto (`/manifest.webmanifest`) já segue o
painel sozinho** — nome, cores e descrição vêm do conteúdo atual (config +
overrides) e mudam na hora sem rebuild; só o ícone instalado é que precisa do rebuild acima.

## Instalar como app (PWA)

O app pode ser "instalado" na tela inicial do celular, como um app de verdade (ícone próprio,
sem barra do navegador). Não existe app na loja — é o mesmo site, instalado direto do
navegador:

- **iPhone**: abra no Safari → toque em Compartilhar → **Adicionar à Tela de Início**.
- **Android**: abra no Chrome → menu **⋮** → **Instalar aplicativo**.

O app mostra esse mesmo lembrete sozinho (um cartão discreto no fim de "Hoje" e "Eu"), que some
depois de instalado ou depois que a pessoa fecha o cartão uma vez.

## Como funciona o login

- **Só e-mail**: a pessoa digita o e-mail usado na compra e entra. Não existe tela de
  cadastro nem nada a memorizar — se o e-mail está liberado (veja "Como fechar o portão"
  abaixo), o login cria a conta na hora, se ainda não existir.
- **Acesso bloqueado**: se o dono bloquear alguém (veja "Como ver usuários e bloquear"
  abaixo), a pessoa consegue digitar o e-mail certo mas recebe a mensagem "seu acesso está
  bloqueado" e não entra.
- **Dono**: definido pela variável `OWNER_EMAIL` no ambiente do servidor. Basta esse e-mail
  fazer login (também só com e-mail) para cair automaticamente como dono, com acesso ao
  Painel, que os alunos não têm.
- **PIN do dono** (opcional, recomendado): se a variável `OWNER_PIN` estiver configurada, o
  login com o e-mail do dono passa a exigir também esse PIN (6 ou mais dígitos) — a tela de
  entrar mostra um segundo campo assim que reconhece o e-mail do dono. Compradores comuns
  nunca veem esse campo e continuam entrando só com e-mail. Sem `OWNER_PIN`, qualquer pessoa
  que digitar o e-mail do dono entra no painel.
- **Sessão lembrada**: depois de entrar, o comprador não precisa digitar o e-mail de novo por 90 dias (isso não aparece pra ele; o acesso ao conteúdo não expira).
- **Limite de tentativas**: login aceita no máximo 20 tentativas a cada 10 minutos por IP.
  Depois disso o app responde "muitas tentativas, aguarde alguns minutos" (código 429). Essa
  contagem fica só na memória do servidor — ela zera se a aplicação reiniciar — e é por IP,
  então pessoas atrás do mesmo IP (ex.: mesma rede Wi-Fi ou um proxy corporativo) compartilham
  o mesmo limite.

## Onde os dados ficam

Tudo fica num banco de dados MySQL — usuários, check-ins, medições e progresso de cada
aluno nos módulos. Onde esse MySQL mora depende de onde o app foi publicado: no plano de
hospedagem da Hostinger ele fica junto do próprio site; numa VPS ele fica num banco
compartilhado da VPS, com um "cofre" separado só deste app. Em qualquer um dos dois, nada
fica só na memória do navegador: se o aluno trocar de celular e fizer login de novo, o
progresso está lá.

## Como ver usuários e bloquear

Faça login como dono e vá em **Painel → Usuários**. Você vê a lista de todo mundo cadastrado
(e-mail, status, data de criação) e pode bloquear ou liberar o acesso de qualquer um ali
mesmo, sem precisar do webhook.

## O que fazer se o app cair

1. Entre no painel da Hostinger, na seção do site Node.js, e clique em **reiniciar a
   aplicação** (o mesmo botão usado depois de publicar uma atualização —
   `hosting_restartNode_jsApplicationV1` no vocabulário técnico).
2. Se reiniciar não resolver, leia os **logs de tempo de execução** (runtime logs) do site —
   eles mostram o erro real (banco fora do ar, variável de ambiente faltando, etc.).
3. Para confirmar que voltou ao normal, rode `bash scripts/smoke.sh https://SEU_DOMINIO` — se
   tudo aparecer "OK", está tudo funcionando.

Se o app está numa VPS, o caminho é outro: peça pro Claude ler os logs do projeto e
reiniciá-lo (`VPS_getProjectLogsV1` e `VPS_restartProjectV1` no vocabulário técnico). Você
não precisa entrar em servidor nenhum.

Veja a receita completa de publicação em `docs/PUBLICAR.md`.

## Sobre o aviso do npm audit

Rodar `npm audit` mostra alertas na biblioteca `expr-eval` (usada para calcular o resultado
do módulo Calculadora). Isso não é uma vulnerabilidade explorável neste app: `expr-eval` só
roda dentro do navegador de quem está usando a calculadora, calculando uma fórmula que o
próprio dono escreveu no `app.config.json` (ou via Painel) — não existe caminho para um
visitante malicioso injetar uma fórmula arbitrária no servidor. Pode ignorar esse aviso com
segurança.

## Como fechar o portão depois

Por padrão o app fica de "portão aberto": qualquer e-mail que tentar entrar em "entrar" ganha
uma conta na hora, sem precisar de webhook nem cadastro prévio — é assim que o app funciona
antes de você ligar a liberação automática. Pra travar isso e só deixar entrar quem realmente
comprou, siga os dois passos abaixo, nesta ordem:

1. **Configure o webhook da plataforma de pagamento** para chamar
   `POST /api/acesso/liberar` a cada compra aprovada (e a cada reembolso/chargeback) — veja
   como logo abaixo.
2. **Ligue o portão**: defina `ACESSO_FECHADO=1` nas variáveis de ambiente da Hostinger e
   reinicie a aplicação (`hosting_restartNode_jsApplicationV1`). A partir daí, só e-mails já
   liberados (pelo webhook, ou colocados manualmente em **Painel → Usuários**) conseguem
   entrar; quem tentar com um e-mail desconhecido recebe "este e-mail não está na lista de
   compradores" (código 403) e nenhuma conta é criada. Enquanto essa variável não existir (ou
   não for `"1"`), o comportamento padrão de portão aberto continua valendo.

Quando alguém compra o produto, a plataforma de pagamento (Hotmart, Digistore24, Cakto etc.)
pode avisar o app automaticamente para liberar (ou bloquear) o acesso da pessoa. Isso é feito
por um "webhook": a plataforma chama uma rota do app assim que o pagamento é aprovado (ou
reembolsado/estornado).

A rota é `POST /api/acesso/liberar`. Ela exige um "token" (um código longo que só você e a
plataforma de pagamento conhecem) enviado no cabeçalho `Authorization`. Esse token é o valor
de `ACCESS_TOKEN` no seu `.env`.

Corpo da chamada (JSON):
- `email`: o e-mail de quem comprou.
- `status`: `"ativo"` (libera) ou `"bloqueado"` (bloqueia). Se não vier, o padrão é `"ativo"`.

O que acontece:
- Se o e-mail já existe no banco → o status dele é atualizado.
- Se o e-mail não existe e o status é `"ativo"` → uma conta é criada, já pronta pra fazer
  login (é só digitar o e-mail em "entrar", não tem mais nada a definir).
- Se o e-mail não existe e o status é `"bloqueado"` → nada acontece (não faz sentido bloquear
  quem nunca existiu).

Exemplo de chamada com `curl` (troque `SEU_TOKEN`, `SEU_DOMINIO` e o e-mail):

```bash
curl -X POST https://SEU_DOMINIO/api/acesso/liberar \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"comprador@exemplo.com","status":"ativo"}'
```

Resposta esperada: `{"ok":true,"acao":"criar"}` (ou `"atualizar"`, `"ignorar"`, dependendo do caso).

Na prática, você configura essa URL e esse token dentro do painel de webhooks da plataforma de
pagamento (Hotmart, Digistore24, Cakto etc.), mapeando o evento de "compra aprovada" para
`status:"ativo"` e o de "reembolso/chargeback" para `status:"bloqueado"`.

Depois de liberado, o comprador entra em "entrar" com o mesmo e-mail usado na compra — e a
conta pré-liberada já funciona.

**A conta do dono é protegida.** Essa rota nunca cria, bloqueia ou libera a conta cujo e-mail
é o `OWNER_EMAIL`, nem qualquer conta marcada como dono — mesmo que a plataforma de pagamento
mande esse e-mail por engano, a resposta é `{"ok":false,"acao":"protegido"}` e nada muda. Se
mesmo assim você ficar bloqueado (por exemplo, mexendo direto no banco), reinicie a aplicação
na Hostinger (Node.js → reiniciar) — o próximo login reaplica automaticamente o papel de dono
e reativa a conta.
