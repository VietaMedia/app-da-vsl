# Como publicar o app na Hostinger

Receita validada em testes reais de publicação (spikes), usando as ferramentas MCP da
Hostinger. Siga a ordem — ela evita os dois erros que mais custam tempo (ver "Lições
aprendidas" no fim).

> ⚠️ **Não defina `NODE_ENV` nas variáveis da Hostinger.** Com `NODE_ENV=production` o servidor de build pula as dependências de desenvolvimento e o build quebra. O `next start` já roda em modo produção sozinho.

## Passo a passo

1. **Gerar um subdomínio grátis** — `hosting_generateAFreeSubdomainV1`. Use este subdomínio
   se ainda não tiver um domínio próprio apontado.

2. **Criar o site** — `hosting_createWebsiteV1`, informando o id do pedido (order id) do
   plano Business da Hostinger e o domínio/subdomínio do passo 1.

3. **Criar o banco de dados** — `hosting_createAccountDatabaseV1`. Gere uma senha aleatória
   de 20 caracteres para o usuário do banco (nunca reaproveite senha de outro projeto).

4. **Definir as variáveis de ambiente** — `hosting_replaceNode_jsEnvironmentVariablesV1`:
   - `DATABASE_URL=mysql://USUARIO:SENHA@localhost:3306/BANCO` — **o host tem que ser
     `localhost`**, não o host `srvNNNN.hstgr.io` que a Hostinger mostra no painel (veja
     lição 1 abaixo).
   - `SESSION_SECRET`: 32+ caracteres aleatórios.
   - `OWNER_EMAIL`: e-mail do dono/mentor. O dono só digita esse e-mail em "entrar", igual
     qualquer aluno, e cai automaticamente com acesso ao Painel.
   - `OWNER_PIN` (**recomendado**, 6+ dígitos): PIN extra exigido só do e-mail do dono ao
     entrar. Sem `OWNER_PIN`, qualquer pessoa que digitar o e-mail do dono entra no painel.
     Compradores comuns continuam entrando só com e-mail, sem PIN.
   - `ACCESS_TOKEN`: token longo aleatório, usado pelo webhook de pagamento (ver
     `docs/COMO-FUNCIONA.md`).
   - `ACESSO_FECHADO` (opcional): deixe de fora no primeiro deploy (portão aberto, qualquer
     e-mail entra). Só defina como `"1"` depois de configurar o webhook de liberação — veja
     "Como fechar o portão depois" em `docs/COMO-FUNCIONA.md`.

5. **Zipar o projeto**, excluindo: `node_modules`, `.next`, `.env`, `.superpowers`, `.git`.
   (O build (`npm run build`) roda automaticamente um passo `postbuild` que copia `public/`
   e `.next/static` para dentro de `.next/standalone` — necessário porque o modo
   `output: 'standalone'` do Next.js não inclui esses arquivos sozinho.)

6. **Fazer o deploy** — `hosting_deployJsApplication` com o zip. A Hostinger detecta
   automaticamente que é um projeto `next` e usa Node 20.

7. **Aguardar o build terminar** — chame `hosting_getNode_jsBuildDetailsV1` repetidamente
   (polling) até o status virar `completed`.

8. **Reiniciar a aplicação** — `hosting_restartNode_jsApplicationV1` (necessário depois do
   primeiro deploy e sempre que trocar variáveis de ambiente).

9. **Rodar o smoke test** — `bash scripts/smoke.sh https://SEU_DOMINIO`. Ele confere rota de
   saúde, banco, manifesto PWA, página de entrar, redirecionamento do app protegido e login
   por e-mail. Atenção: cada execução cria uma conta de teste real
   (`smoke-<timestamp>@teste.local`) no banco de produção — o dono pode bloquear ou
   simplesmente ignorar essas contas na lista de usuários.

10. **Se algo falhar**, leia os logs de runtime — `hosting_getNode_jsRuntimeLogsV1` — antes
    de mexer em qualquer coisa. Geralmente o erro já aparece ali (falha de conexão com banco,
    variável faltando, etc.).

## Lições aprendidas (não pule)

- **`DATABASE_URL` (e qualquer `DB_HOST`) precisa usar `localhost`.** O host
  `srvNNNN.hstgr.io` que aparece no painel da Hostinger é para acesso remoto — de dentro da
  própria aplicação hospedada, esse host é recusado. Use sempre `localhost` na variável de
  ambiente de produção.
- **Variáveis públicas do Next.js (`NEXT_PUBLIC_*`) são "gravadas" no build.** Se você mudar
  uma variável desse tipo depois do deploy, só reiniciar a aplicação não basta — é preciso
  rodar o build de novo (`hosting_startNode_jsBuildV1` ou um novo deploy) para o valor novo
  entrar no código enviado ao navegador.

## Para desenvolver localmente com o banco de produção

Se precisar rodar o app na sua máquina apontando pro banco MySQL que está na Hostinger:

1. Libere uma conexão remota ao banco — `hosting_createDatabaseRemoteConnectionV1`,
   autorizando o IP da sua máquina (ou `%` para qualquer IP, temporariamente).
2. Na sua `DATABASE_URL` local, use o **host de acesso remoto do banco** (não `localhost`,
   que só funciona dentro do próprio servidor da Hostinger).
3. **Se sua máquina tiver IPv6 ativo**, prefira usar o **endereço IPv4** do servidor da
   Hostinger na `DATABASE_URL` — em alguns casos a resolução por IPv6 falha ou demora,
   mesmo com a conexão remota liberada.
