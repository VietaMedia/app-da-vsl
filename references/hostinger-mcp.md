# Hostinger por MCP — o que a skill usa e as armadilhas

Ferramentas (conector `hostinger-hosting`): `hosting_listOrdersV1` (id do plano), `hosting_generateAFreeSubdomainV1`, `hosting_createWebsiteV1`, `hosting_listWebsitesV1`, `hosting_createAccountDatabaseV1`, `hosting_listAccountDatabasesV1`, `hosting_changeDatabasePasswordV1`, `hosting_createDatabaseRemoteConnectionV1` (só pra dev local), `hosting_replaceNode_jsEnvironmentVariablesV1` (substitui TODAS as variáveis: mande o conjunto completo), `hosting_deployJsApplication` (zip sem node_modules; detecta `next`), `hosting_getNode_jsBuildDetailsV1` (esperar `completed`), `hosting_getNodeJSBuildLogsV1`, `hosting_getNode_jsRuntimeLogsV1`, `hosting_restartNode_jsApplicationV1`, `hosting_deleteWebsiteV1` (só com confirmação explícita do usuário).

Armadilhas comprovadas:
1. `DATABASE_URL` em produção usa `localhost`; o host `srvNNNN.hstgr.io` recusa a conexão vinda do próprio app.
2. Nunca definir `NODE_ENV` nas variáveis: o servidor de build pula pacotes e o build quebra.
3. Site novo leva ~1 min pra existir; build ~1-2 min; poll a cada 5 s por até 5 min.
4. Se o banco recusar a senha, troque com `hosting_changeDatabasePasswordV1` e atualize a variável.
5. Máquina com IPv6: pra dev local use o IPv4 do servidor no `DATABASE_URL`.
6. Variáveis "públicas" do Next (`NEXT_PUBLIC_*`) são gravadas no build; o template não usa nenhuma.
7. Depois de trocar variáveis, `hosting_restartNode_jsApplicationV1`.
8. O plano Business tem limite de sites; `hosting_listWebsitesV1` mostra quantos existem.
9. Senha de banco precisa ter letras E pelo menos um número; senão `[Hosting:9999]`.
10. **Vários apps numa conta só.** Em 2026-09-06, com 7 apps Node + 7 bancos no mesmo plano Business, o MySQL local parou de responder pra todos ao mesmo tempo (health 503 "falha ao conectar ao banco", processos Node normais, banco acessível de fora). Não é código. Regra: 1-2 apps por plano; se for empilhar, acrescente `?connection_limit=3` ao `DATABASE_URL` (hipótese de mitigação, não confirmada). Se todos os apps de uma conta caírem juntos, olhe o banco antes do código.

## VPS (conector `hostinger-vps`)

Preparação: `VPS_getVirtualMachinesV1` (sem parâmetros, lista tudo),
`VPS_getVirtualMachineDetailsV1` (id → IP, estado, template),
`VPS_createPostInstallScriptV1` (name + content, bash, máx 48 KB, roda uma vez no fim da
instalação, log em `/post_install.log`), `VPS_setupPurchasedVirtualMachineV1`
(virtualMachineId + data_center_id + template_id obrigatórios; `post_install_script_id`,
`hostname`, `password`, `public_key`, `enable_backups` opcionais),
`VPS_getTemplatesV1` (o template certo é **"Ubuntu 24.04 with Docker"**, id 1121; o "with Claude Code" NÃO suporta o Docker Manager),
`VPS_getDataCenterListV1` (Campinas é 22).

Firewall: `VPS_createNewFirewallV1` (só `name`) → `VPS_createFirewallRuleV1`
(firewallId, protocol, port, source, source_detail) → `VPS_activateFirewallV1`
(firewallId + virtualMachineId). **Por padrão o firewall derruba tudo que entra** — sem
regra de aceite, nada passa. Abrir 22, 80 e 443.

Projetos docker: `VPS_createNewProjectV1` (virtualMachineId, project_name, content,
environment). `content` aceita **YAML cru do compose**, ou uma URL que devolva o
compose, ou `https://github.com/user/repo`. **Projeto com o mesmo nome é substituído** —
é assim que a gente republica. Rede compartilhada: `borda_default`, criada
automaticamente quando o projeto `borda` sobe; os apps entram nela como rede externa.
`VPS_getProjectListV1`, `VPS_getProjectContentsV1`,
`VPS_getProjectContainersV1`, `VPS_getProjectLogsV1` (300 últimas linhas),
`VPS_restartProjectV1`, `VPS_updateProjectV1` (puxa imagem nova e recria),
`VPS_startProjectV1`, `VPS_stopProjectV1`, `VPS_deleteProjectV1`.

DNS: `DNS_updateDNSRecordsV1` (domain + zone[{name, type, records:[{content}], ttl?}],
`overwrite` opcional). `domains_getDomainListV1` diz se o domínio está na conta.

Armadilhas da VPS:
1. Post-install é opcional (só otimizações) e roda uma vez; nunca recrie a VPS por causa
   dele.
2. Não existe API pra escrever arquivo avulso na VPS. Na prática nada precisa disso: SSH
   serve só pra restaurar backup de banco ou olhar dado direto no MySQL. Se você quiser
   SSH pra publicar um app, algo no desenho falhou — registre em vez de contornar.
3. `DATABASE_URL` na VPS usa o host `mysql` (nome do serviço na rede docker), nunca
   `localhost` — `localhost` dentro do container do app é o próprio container.
4. A VPS constrói a imagem no primeiro `up` (leva alguns minutos numa KVM 1); um app de
   cada vez.

## Receitas

- Plano Business: `scripts/publicar-business.md` (era `scripts/publicar.md`).
- VPS: `scripts/publicar-vps.md` (parte 1 prepara a máquina, parte 2 publica cada app).
- Quem escolhe entre as duas é o passo 7 do `SKILL.md`, com `scripts/detectar-destino.mjs`.
6. **Template da VPS decide tudo.** O Docker Manager (todas as `VPS_*Project*`) só funciona em templates que ele
   suporta. "Ubuntu 24.04 with Claude Code" (1189) responde `[VPS:2044] Currently installed operating system does
   not support Docker Manager`. Use **"Ubuntu 24.04 with Docker"** (1121). Se a VPS já veio com outro sistema, a
   saída é trocar o sistema operacional no hPanel (VPS → Sistema operacional) — `VPS_recreateVirtualMachineV1`
   apaga a máquina e o Claude não deve chamá-la sem o "sim" explícito.
7. `hostname` em `VPS_setupPurchasedVirtualMachineV1` precisa ser FQDN (`apps.dominio.com.br`); nome simples dá
   `[VPS:2004] Wrong hostname FQDN format`.
8. Firewall: `protocol: "TCP"` + `port` funciona (22, 80, 443 criados assim). Ativar com `VPS_activateFirewallV1`
   só quando a VM estiver `running`.
9. DNS: em `DNS_updateDNSRecordsV1`, `name` é o rótulo puro (`renda-smart`), não o FQDN — confirmado.
