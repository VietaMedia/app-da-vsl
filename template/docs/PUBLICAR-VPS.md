# Como publicar este app numa VPS da Hostinger

Este é o caminho da "aula 2": vários apps na mesma VPS, cada um com seu endereço e seu
banco. O caminho do plano Business está em `PUBLICAR.md` e continua valendo.

## O desenho

- A VPS roda **Docker**. Uma rede chamada `borda_default` liga tudo (é a rede criada
  automaticamente pelo projeto compose `borda`).
- Um projeto compose chamado `borda` roda duas coisas: o **Caddy** (que atende as portas
  80 e 443, distribui cada endereço pro app certo e emite o certificado HTTPS sozinho) e
  um **MySQL 8** compartilhado.
- Cada app é um projeto compose próprio, `app-<slug>`, com dois serviços: um que cria o
  banco e o usuário daquele app, e o app em si.
- A imagem do app é construída na própria VPS, na primeira vez que o projeto sobe, a
  partir do repositório privado do app no GitHub. Leva alguns minutos numa KVM 1. Nada de
  conta em registro de imagens.

## Variáveis do app na VPS

As mesmas do plano Business, com uma diferença:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `mysql://<slug>:<senha>@mysql:3306/<slug>?connection_limit=5` — o host é **`mysql`**, o nome do serviço na rede docker. `localhost` aqui é o próprio container do app. |
| `SESSION_SECRET` | 48 hexadecimais (`openssl rand -hex 24`). |
| `OWNER_EMAIL` | e-mail do dono. |
| `OWNER_PIN` | 6 dígitos. |
| `ACCESS_TOKEN` | token longo, pro webhook. |
| `ACESSO_FECHADO` | só depois do webhook ligado. |

Aqui `NODE_ENV=production` **pode** existir — ele já vem dentro da imagem. A proibição de
`NODE_ENV` vale só pro plano Business, onde o servidor compila o projeto.

## Endereço

Cada app precisa de um subdomínio (`app1.seudominio.com`) apontando com um registro A pro
IP da VPS. Sem domínio próprio dá pra espiar o app em
`http://<slug>.<ip-com-tracos>.sslip.io`, **mas só em HTTP** — e sem HTTPS o app **não
instala no celular** como aplicativo. É degrau, não entrega.

## Quando alguma coisa der errado

O Claude tem as ferramentas: ele lê os logs de todos os containers do projeto de uma vez e
reinicia o projeto sem entrar em servidor nenhum. Peça a ele.
