# Como publicar o app na Hostinger (receita MCP passo a passo)

> Esta é a receita do **plano Business** (aula 1). Para publicar numa VPS, use
> `publicar-vps.md`. Quem escolhe entre as duas é o passo 7 do `SKILL.md`.

Fonte de verdade original: `template/docs/PUBLICAR.md`. Esta cópia existe pra skill
consultar sem depender do template estar aberto na sessão — se a receita do template
mudar, atualize aqui também. Nomes de ferramenta abaixo são **verbatim** (não invente
variações).

> ⚠️ **Nunca defina `NODE_ENV`** nas variáveis de ambiente da Hostinger. Com
> `NODE_ENV=production` o servidor de build pula as dependências de desenvolvimento e
> o build quebra. O `next start` já roda em modo produção sozinho.

## Passo a passo

1. **Gerar um subdomínio grátis** — `hosting_generateAFreeSubdomainV1`. Use este
   subdomínio se o mentorado ainda não tiver domínio próprio apontado.

2. **Criar o site** — `hosting_createWebsiteV1`, informando o id do pedido (order id)
   do plano Business da Hostinger (pegue com `hosting_listOrdersV1`) e o
   domínio/subdomínio do passo 1.

3. **Criar o banco de dados** — `hosting_createAccountDatabaseV1`. Gere uma senha
   aleatória de 20 caracteres pro usuário do banco (nunca reaproveite senha de outro
   projeto).

4. **Definir as variáveis de ambiente** — `hosting_replaceNode_jsEnvironmentVariablesV1`:

   | Variável | Regra |
   |---|---|
   | `DATABASE_URL` | `mysql://USUARIO:SENHA@localhost:3306/BANCO` — **o host tem que ser `localhost`**, nunca o host `srvNNNN.hstgr.io` que aparece no painel (ver lição 1 abaixo). |
   | `SESSION_SECRET` | 48 caracteres hexadecimais aleatórios. Gere com `openssl rand -hex 24`. |
   | `OWNER_EMAIL` | e-mail do dono/mentor. Ele digita esse e-mail em "entrar", igual qualquer aluno, e cai automaticamente com acesso ao Painel. |
   | `OWNER_PIN` | **recomendado**, 6 dígitos. PIN extra exigido só do e-mail do dono ao entrar. Sem ele, qualquer pessoa que souber o e-mail do dono entra no painel. Compradores comuns continuam entrando só com e-mail, sem PIN. |
   | `ACCESS_TOKEN` | token longo aleatório, usado pelo webhook de pagamento. |
   | `ACESSO_FECHADO` | opcional. Deixe de fora no primeiro deploy (portão aberto, qualquer e-mail entra). Só defina como `"1"` depois de configurar o webhook de liberação. |

   Nunca defina `NODE_ENV` — ver aviso no topo.

5. **Zipar o projeto**, excluindo: `node_modules`, `.next`, `.env`, `.superpowers`,
   `.git`. (O `npm run build` roda um passo `postbuild` que copia `public/` e
   `.next/static` pra dentro de `.next/standalone` — necessário porque o modo
   `output: 'standalone'` do Next.js não inclui esses arquivos sozinho.)

6. **Fazer o deploy** — `hosting_deployJsApplication` com o zip. A Hostinger detecta
   automaticamente que é um projeto `next` e usa Node 20.

7. **Aguardar o build terminar** — loop de espera chamando
   `hosting_getNode_jsBuildDetailsV1` repetidamente (polling, com pausa entre
   tentativas) até o status virar `completed`. Se o status virar `failed`, leia os
   logs (`hosting_getNodeJSBuildLogsV1`) antes de tentar de novo.

8. **Reiniciar a aplicação** — `hosting_restartNode_jsApplicationV1` (necessário depois
   do primeiro deploy e sempre que trocar variáveis de ambiente).

9. **Rodar o smoke test** — `bash scripts/smoke.sh https://SEU_DOMINIO` (ou
   `~/.claude/skills/app-da-vsl/scripts/smoke.sh`). Ele confere rota de saúde, banco,
   manifesto PWA, página de entrar, redirecionamento do app protegido e login por
   e-mail. Atenção: cada execução cria uma conta de teste real
   (`smoke-<timestamp>@teste.local`) no banco de produção.

10. **Rodar as checagens de página** — `screenshots.mjs <baseUrl> <email> <pastaSaida>`
    percorre o app publicado e roda a VERIFICACAO automática (padding de cartão,
    ausência de scroll horizontal em 360/390/430, tamanho mínimo de fonte, imagens
    dentro do cartão). Trate qualquer `VERIFICACAO: FALHOU` antes de considerar a
    publicação concluída.

11. **Se algo falhar**, leia os logs de runtime — `hosting_getNode_jsRuntimeLogsV1` —
    antes de mexer em qualquer coisa. Geralmente o erro já aparece ali (falha de
    conexão com banco, variável faltando, etc.).

## Lições aprendidas (não pule)

- **`DATABASE_URL` (e qualquer `DB_HOST`) precisa usar `localhost`.** O host
  `srvNNNN.hstgr.io` que aparece no painel da Hostinger é pra acesso remoto — de
  dentro da própria aplicação hospedada, esse host é recusado. Use sempre `localhost`
  na variável de ambiente de produção.
- **Variáveis públicas do Next.js (`NEXT_PUBLIC_*`) são "gravadas" no build.** Se
  você mudar uma variável desse tipo depois do deploy, só reiniciar a aplicação não
  basta — é preciso rodar o build de novo (`hosting_startNode_jsBuildV1` ou um novo
  deploy) pro valor novo entrar no código enviado ao navegador.
- **Se o login/auth falhar depois do deploy**, o motivo mais comum é a senha do banco
  estar errada ou desatualizada na `DATABASE_URL` — reset com
  `hosting_changeDatabasePasswordV1` e atualize a variável de ambiente
  correspondente (com o restart do passo 8 depois).
- **IPv6 pra desenvolvimento local**: se sua máquina tiver IPv6 ativo, prefira o
  **endereço IPv4** do servidor da Hostinger na `DATABASE_URL` local — a resolução
  por IPv6 às vezes falha ou demora, mesmo com a conexão remota liberada.

## Para desenvolver localmente com o banco de produção

1. Libere uma conexão remota ao banco — `hosting_createDatabaseRemoteConnectionV1`,
   autorizando o IP da sua máquina (ou `%` pra qualquer IP, temporariamente).
2. Na `DATABASE_URL` local, use o **host de acesso remoto do banco** (não
   `localhost`, que só funciona dentro do próprio servidor da Hostinger).
3. Se sua máquina tiver IPv6 ativo, use o **IPv4** do servidor (ver lição acima).

## Ferramentas MCP citadas nesta receita (verbatim)

`hosting_generateAFreeSubdomainV1`, `hosting_createWebsiteV1`, `hosting_listOrdersV1`,
`hosting_createAccountDatabaseV1`, `hosting_replaceNode_jsEnvironmentVariablesV1`,
`hosting_deployJsApplication`, `hosting_getNode_jsBuildDetailsV1`,
`hosting_getNodeJSBuildLogsV1`, `hosting_getNode_jsRuntimeLogsV1`,
`hosting_restartNode_jsApplicationV1`, `hosting_startNode_jsBuildV1`,
`hosting_createDatabaseRemoteConnectionV1`, `hosting_changeDatabasePasswordV1`.

> Senha do banco: a Hostinger exige **pelo menos um número** (e letras). Gere com letras+dígitos, 20 caracteres; sem `/`, `+`, `=`.
