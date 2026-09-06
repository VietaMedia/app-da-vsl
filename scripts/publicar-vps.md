# Publicar na VPS (receita MCP)

Nomes de ferramenta são **verbatim**. Não invente variações. O ramo do plano Business é
outro arquivo: `publicar-business.md`.

Desenho em uma frase: uma VPS tem **um** projeto compose `borda` (Caddy na porta de entrada
+ MySQL compartilhado) e **um projeto por app**, e todos conversam pela rede
`borda_default` — a rede padrão que o Docker Compose cria sozinho para o projeto `borda`
(ele nomeia a rede padrão de um projeto como `<projeto>_default`). Não existe
`docker network create` em lugar nenhum desta receita.

## Parte 1 — Preparar a VPS (uma vez por máquina)

Antes de tudo, veja se ela já está preparada:

```
VPS_getProjectListV1(virtualMachineId: <id>)
```

Se aparecer um projeto chamado `borda` com os containers `caddy` e `mysql` rodando, **pule
a parte 1 inteira**. Ela já foi feita.

### 1.1 Estado da máquina

`VPS_getVirtualMachinesV1` (sem parâmetros) mostra o estado de cada VPS.

**Se estiver `running` — o caso normal, de quem comprou a VPS no hPanel — primeiro
confira o sistema:** `VPS_getVirtualMachineDetailsV1` → `template.name`. O Docker Manager
(as ferramentas `VPS_*Project*`) só funciona em templates que ele suporta, e o certo é
**"Ubuntu 24.04 with Docker"** (id 1121). Se for outro — o "with Claude Code", por exemplo,
responde `[VPS:2044] ... does not support Docker Manager` — **peça pra ele trocar o sistema
no hPanel** (VPS → Sistema operacional → "Ubuntu 24.04 with Docker") antes de qualquer
coisa; a máquina volta vazia, então isso só serve pra VPS recém-comprada. Não chame
`VPS_recreateVirtualMachineV1` por conta própria.

Com o template certo, não instale nada: nenhum post-install, nenhum SSH. Vá direto para o
firewall (1.2) e para o projeto `borda` (1.3).

> **RISCO:** que o Docker Manager instale o Docker sozinho é o comportamento documentado,
> mas ainda **não foi observado nesta skill**. Na primeira VPS, se
> `VPS_createNewProjectV1` falhar reclamando de Docker, registre o erro exato no relatório
> e só então considere o caminho do post-install.

**Recriar a máquina apaga tudo.** Nunca use `VPS_recreateVirtualMachineV1` nem
`VPS_setupPurchasedVirtualMachineV1` numa VPS que já está `running`.

**Se estiver `initial`** (comprada e nunca instalada), aí sim você instala, e só aqui o
post-install opcional entra:

1. `VPS_getTemplatesV1` → ache o id do template **"Ubuntu 24.04 with Docker"** (era 1121
   em 2026-09; confira, não chute).
2. `VPS_getDataCenterListV1` → confirme que Campinas é o id 22.
3. Opcional, e só aqui: `VPS_createPostInstallScriptV1(name: "app-da-vsl", content:
   <conteúdo de scripts/post-install-vps.sh>)` → guarde o `id` da resposta. Ele só faz três
   otimizações (Docker se faltar, swap de 2 GB, rotação de log). Nada da publicação depende
   dele.
4. `VPS_setupPurchasedVirtualMachineV1(virtualMachineId, data_center_id: 22,
   template_id: <do passo 1>, post_install_script_id: <do passo 3, se usou>,
   hostname: "apps.<dominio-do-mentorado>")` — tem que ser FQDN, nome simples é recusado.
5. Espere. A instalação leva minutos. Consulte `VPS_getVirtualMachineDetailsV1` até o
   estado virar `running`, com pausa entre tentativas.

### 1.2 Firewall

Por padrão o firewall da Hostinger **derruba tudo que entra**.

1. `VPS_createNewFirewallV1(name: "app-da-vsl")` → guarde o `id`.
2. Três vezes `VPS_createFirewallRuleV1(firewallId, protocol, port, source: "any",
   source_detail: "any")`:
   - `protocol: "SSH", port: "22"`
   - `protocol: "HTTP", port: "80"`
   - `protocol: "HTTPS", port: "443"`
3. `VPS_activateFirewallV1(firewallId, virtualMachineId)`.

**RISCO:** o enum de `protocol` aceita tanto `TCP` quanto os atalhos `SSH`/`HTTP`/`HTTPS`.
Não está observado se o atalho preenche a porta sozinho ou se ainda exige `port`. Mande os
dois (como acima); se a API reclamar, troque para `protocol: "TCP"` com a porta e refaça.

Sem o 80 aberto o Caddy **não consegue emitir certificado** — o desafio do Let's Encrypt
passa pela porta 80. Não pule.

### 1.3 Subir o projeto `borda`

1. Gere a senha do root do MySQL: `openssl rand -hex 20` (letras e números, sem `/ + =`).
2. Guarde-a em `~/.app-da-vsl/vps-<virtualMachineId>.json` com permissão 600:

```bash
mkdir -p ~/.app-da-vsl && chmod 700 ~/.app-da-vsl
printf '{"virtualMachineId":%s,"ip":"%s","mysqlRootPassword":"%s"}\n' "$ID" "$IP" "$SENHA" \
  > ~/.app-da-vsl/vps-$ID.json
chmod 600 ~/.app-da-vsl/vps-$ID.json
```

3. `VPS_createNewProjectV1(virtualMachineId, project_name: "borda",
   content: <conteúdo de scripts/compose-borda.yml>,
   environment: "MYSQL_ROOT_PASSWORD=<senha>")`.

   O nome do projeto tem que ser exatamente **`borda`** — é dele que sai o nome da rede
   `borda_default`, que todo compose de app referencia.
4. `VPS_getProjectContainersV1(virtualMachineId, projectName: "borda")` até `caddy` e
   `mysql` aparecerem rodando e o `mysql` ficar `healthy`. O primeiro boot do MySQL cria o
   diretório de dados e leva de 30 a 60 segundos.
5. Se algo não subir: `VPS_getProjectLogsV1(virtualMachineId, projectName: "borda")`.

Detalhes do `compose-borda.yml` que valem ouro:

- O MySQL **não publica porta nenhuma pro host**. Ele só existe dentro da rede
  `borda_default`. Isso é o isolamento — nenhuma regra de firewall precisa proteger o 3306.
- O compose **não declara rede nenhuma**, de propósito. Quem cria a `borda_default` é o
  próprio Compose.
- `--default-authentication-plugin=mysql_native_password` existe porque o Prisma tropeça no
  `caching_sha2_password` em alguns clientes. Essa é a forma do MySQL **8.0** (no 8.4 a flag
  virou `--mysql-native-password=ON`; a imagem aqui é `mysql:8.0`). Se o container não
  subir, olhe `VPS_getProjectLogsV1` — se reclamar da flag, remova a linha e recrie o
  projeto.
- `${MYSQL_ROOT_PASSWORD}` vem do parâmetro `environment` do `VPS_createNewProjectV1`.
  **RISCO:** o formato exato desse parâmetro (uma string) não foi observado — a hipótese é
  `CHAVE=valor` por linha, gravado como `.env` ao lado do compose. **Observar a resposta
  real de `VPS_createNewProjectV1` e o resultado de `VPS_getProjectContentsV1` na primeira
  chamada e ajustar.** Se a substituição não acontecer, o plano B é escrever os valores
  literais dentro do YAML gerado (o YAML de app é gerado por script, então isso é uma linha
  de mudança em `gerar-compose.mjs`).

**Nunca apague o projeto `borda`.** Ele guarda o volume `mysql_data` — os bancos de todos
os apps da máquina — e a rede que todos os apps usam. `VPS_deleteProjectV1("borda")` é
irreversível e só com confirmação explícita e por escrito do dono.

## SSH

SSH serve para **uma** coisa: restaurar backup de banco ou inspecionar dado direto no
MySQL.

Se você se pegar querendo SSH pra publicar um app, **pare** — algo no desenho falhou.
Registre no relatório o que faltou e por quê, em vez de contornar por SSH.

## Parte 2 — Publicar um app (uma vez por app)

Pré-requisito: a parte 1 feita, e `apps/<slug>/repo/` já existindo com o app montado
(passo 6 do SKILL.md), com o `Dockerfile` e o `.dockerignore` que vieram do template.

Não existe registro de imagem nenhum nesta receita. **A imagem é construída na própria
VPS**, pelo compose, a partir do repositório privado do app no GitHub — com o token que o
mentorado já tem (`gh auth token`, requisito antigo da skill). Nada de GHCR, nada de
GitHub Actions, nenhuma credencial nova.

### 2.1 Garantir o repositório privado do app no GitHub

```bash
cd apps/<slug>/repo
gh repo create <slug>-app --private --source=. --push   # se ainda nao existe
git push                                               # se ja existe
```

Depois pegue os três valores que o gerador precisa:

```bash
gh repo view --json nameWithOwner --jq .nameWithOwner   # -> repo, ex.: VietaMedia/renda-smart-app
git rev-parse HEAD                                      # -> commit (40 hex)
gh auth token                                           # -> ghToken
```

**O repositório continua privado.** O token entra na URL de build
(`https://x-access-token:<ghToken>@github.com/<repo>.git#<commit>`) e por isso ele
**nunca** aparece no YAML: o gerador põe essa URL na variável `REPO_URL` e o YAML só
carrega `context: "${REPO_URL}"`. O Docker Compose interpola variáveis em qualquer valor
de string do compose, `build.context` incluído (verificado com `docker compose config`).

O `#<commit>` no fim serve para forçar reconstrução: republicar com um commit novo muda a
URL e o Docker constrói de novo em vez de reaproveitar cache do repositório.

**Nunca** cole o `ghToken` no `03-entrega.md` nem no `publicacao.json`. Ele só existe no
`apps/<slug>/destino/opcoes.json`, que fica fora do git.

**RISCO:** o BuildKit busca o commit pelo sha completo no contexto git. Isso funciona no
GitHub para commits alcançáveis, mas **não foi observado nesta skill**. Se o build falhar
com algo como `failed to fetch ... <sha>`, troque o fragmento pelo nome do branch
(`#main`) e republique com `VPS_updateProjectV1` — registre a troca no relatório.

### 2.2 Escolher o endereço

1. `domains_getDomainListV1` → o mentorado tem domínio na conta?
   - **Tem** → o endereço é `<slug>.<dominio>`. Crie o registro A:
     ```
     DNS_updateDNSRecordsV1(
       domain: "<dominio>",
       zone: [{ name: "<slug>", type: "A", ttl: 300, records: [{ content: "<ip da VPS>" }] }],
       overwrite: true
     )
     ```
     **RISCO:** a descrição do parâmetro `name` diz "use `@` para nome curinga". Para um
     subdomínio comum o valor esperado é o rótulo puro (`renda-smart`), não o FQDN.
     **Observe a resposta real e confira com `DNS_getDNSRecordsV1` antes de seguir.** Se o
     registro sair como `renda-smart.dominio.com.dominio.com`, o formato é o FQDN — ajuste.
   - **Não tem, e não quer comprar** → endereço de espiada:
     `<slug>.<ip-com-tracos>.sslip.io`, com `https: false` no gerador. **Fica em HTTP.**
     Escreva no `03-entrega.md`, com todas as letras: *sem HTTPS o app não instala no
     celular como aplicativo; isso é pra ver, não pra vender.*
   - **Não tem, e quer comprar** → **portão**: comprar domínio gasta dinheiro. Pergunte uma
     vez, e só compre com o "sim" dele. Nunca compre por iniciativa própria.

2. Confirme a propagação antes de criar o projeto:
   ```bash
   dig +short <slug>.<dominio> @1.1.1.1
   ```
   Tem que devolver o IP da VPS. Se vier vazio, espere e tente de novo — o Caddy só
   consegue certificado depois que o mundo enxerga o nome.

### 2.3 Gerar o compose

```bash
node -e '
const fs=require("fs");
const c=require("crypto");
const {execSync}=require("child_process");
const sh=(cmd)=>execSync(cmd,{cwd:"apps/<slug>/repo"}).toString().trim();
const o={
  slug:"<slug>",
  repo:sh("gh repo view --json nameWithOwner --jq .nameWithOwner"),
  commit:sh("git rev-parse HEAD"),
  ghToken:execSync("gh auth token").toString().trim(),
  host:"<endereco escolhido>",
  https:true,
  dbSenha:c.randomBytes(10).toString("hex"),
  mysqlRootPassword:JSON.parse(fs.readFileSync(process.env.HOME+"/.app-da-vsl/vps-<id>.json","utf8")).mysqlRootPassword,
  sessionSecret:c.randomBytes(24).toString("hex"),
  ownerEmail:"<email do dono>",
  ownerPin:String(Math.floor(100000+Math.random()*900000)),
  accessToken:c.randomBytes(32).toString("hex"),
};
fs.mkdirSync("apps/<slug>/destino",{recursive:true});
fs.writeFileSync("apps/<slug>/destino/opcoes.json",JSON.stringify(o,null,2));
'
node ~/.claude/skills/app-da-vsl/scripts/gerar-compose.mjs apps/<slug>/destino/opcoes.json \
  > apps/<slug>/destino/compose.json
```

O `compose.json` traz `projeto`, `compose`, `environment`, `databaseUrl`, `host` e
`imagem` (o nome local `app-<slug>:<commit7>`, só pra rotular a imagem construída).
**Ele contém senhas e o token do GitHub** — não copie nada dele para o `03-entrega.md`
além do PIN do dono.

### 2.4 Subir o projeto

```
VPS_createNewProjectV1(
  virtualMachineId: <id>,
  project_name: <campo "projeto" do compose.json>,
  content: <campo "compose">,
  environment: <campo "environment">
)
```

Republicar é a mesma chamada com o mesmo `project_name` e um `commit` novo — a documentação
diz que o projeto existente é substituído. `VPS_updateProjectV1(virtualMachineId,
projectName)` recria os containers sem trocar o compose; ele só ajuda se você não mudou o
commit.

### 2.5 Esperar e conferir

1. **O primeiro `up` constrói a imagem dentro da VPS** (`npm ci` + `next build` no
   Dockerfile). Numa KVM 1 isso leva **alguns minutos** — não é travamento. Um app de cada
   vez; não suba dois projetos ao mesmo tempo.

   **RISCO:** memória. A KVM 1 tem 4 GB e o `next build` é o passo mais faminto. Se
   `VPS_getProjectLogsV1` mostrar `Killed`, `signal 9` ou OOM durante o `next build`, o
   fallback documentado é construir a imagem fora da VPS e publicá-la num registro privado,
   com `docker login` na VPS. **Isso não está implementado na skill** — se acontecer,
   registre no `03-entrega.md` e no relatório antes de improvisar. Mitigação barata antes
   disso: garantir o swap de 2 GB (o trecho do `post-install-vps.sh`, aplicável por SSH numa
   máquina já instalada).

2. `VPS_getProjectContainersV1(virtualMachineId, projectName)` até o serviço `app` estar
   rodando e `healthy`. O `criar-banco` deve aparecer como concluído com sucesso — ele
   sai depois de criar o database.
3. Se travar: `VPS_getProjectLogsV1(virtualMachineId, projectName)`.
4. Smoke:
   ```bash
   bash ~/.claude/skills/app-da-vsl/scripts/smoke.sh https://<endereco>
   ```
   (Ou `http://` se for o caminho `sslip.io`.) Ele confere saúde, banco, manifesto PWA,
   página de entrar, app protegido e login. Todos `OK`.
5. Capturas contra o endereço publicado:
   ```bash
   node ~/.claude/skills/app-da-vsl/scripts/screenshots.mjs https://<endereco> teste-<slug>@exemplo.com apps/<slug>/capturas --pin <PIN>
   ```
   Trate qualquer `VERIFICACAO: FALHOU` antes de considerar publicado.

### 2.6 Guardar

Grave `apps/<slug>/publicacao.json` com: `destino: "vps"`, `virtualMachineId`, `ip`,
`projeto`, `host`, `repo`, `commit`, `imagem`, `ownerEmail`, `ownerPin`. **Sem `ghToken`,
sem `dbSenha`, sem `mysqlRootPassword`, sem `sessionSecret`, sem `accessToken`.** Esses
ficam só em `apps/<slug>/destino/opcoes.json`, que não vai para o `03-entrega.md` nem para
o GitHub — acrescente `destino/` ao `.gitignore` da pasta de trabalho.

## Erros que já sabemos que acontecem

| Sintoma | Causa | Conserto |
|---|---|---|
| `network borda_default not found` | o projeto `borda` não existe, ou subiu com outro nome | `VPS_getProjectListV1`; recrie o projeto com `project_name` exatamente `borda` (parte 1.3) |
| Build fica minutos sem sair do lugar no primeiro `up` | é o `next build` acontecendo dentro da VPS | Esperar. Só investigue depois de ~10 min |
| Build morre com `Killed` / OOM no `next build` | memória da KVM 1 | Ver o RISCO em 2.5: swap, e em último caso registro privado |
| `failed to fetch ... <sha>` no build | o contexto git não achou o commit | Trocar `#<commit>` por `#main` e republicar (RISCO de 2.1) |
| `authentication required` / 404 no clone do build | `ghToken` vencido, sem acesso ao repo, ou `REPO_URL` não chegou | `gh auth token` de novo, gerar o compose de novo, `VPS_getProjectContentsV1` pra ver se o `.env` chegou |
| App fica `unhealthy` e reinicia | MySQL ainda subindo no primeiro boot | Esperar; se persistir, `VPS_getProjectLogsV1` e subir o `start-period` do HEALTHCHECK |
| `Access denied for user` | o `criar-banco` rodou antes do MySQL aceitar conexão, ou a senha mudou | `VPS_restartProjectV1` no projeto do app: o `criar-banco` roda de novo e faz `ALTER USER` |
| Certificado não sai | DNS não propagou, ou porta 80 fechada no firewall | `dig` + conferir a regra HTTP |
| Todos os apps caem juntos | MySQL compartilhado | `VPS_getProjectLogsV1("borda")` **antes** de olhar código — a lição do plano Business vale aqui também |
