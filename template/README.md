# App da VSL — template

PWA (app instalável no celular) para entregar produtos de mentoria/infoproduto após a VSL:
login só com o e-mail da compra (com uma avaliação inicial no primeiro acesso), cinco abas para o
aluno (Hoje, Protocolo, Aulas, Kit, Eu), painel do dono (resumo, usuários, conteúdo —
incluindo aparência e identidade visual), módulos de conteúdo (protocolo, rastreador,
calculadora, trilha, biblioteca, lembretes) e liberação de acesso automática via webhook de
pagamento.

## Requisitos

- Node.js 20 ou mais recente.
- Conta Hostinger no plano Business (hospeda o site Node.js + banco MySQL).
- [`gh`](https://cli.github.com/) (CLI do GitHub), se for versionar/publicar via GitHub.

## Rodando localmente

```bash
npm install
cp .env.example .env   # depois edite com seus valores (DATABASE_URL, SESSION_SECRET, etc.)
npm run dev            # sobe o app em http://localhost:3000
npm run icones          # gera os ícones do PWA a partir do app.config.json
npm test                # roda a suíte de testes
```

## Documentação

- [`docs/PUBLICAR.md`](docs/PUBLICAR.md) — receita passo a passo para publicar na Hostinger.
- [`docs/COMO-FUNCIONA.md`](docs/COMO-FUNCIONA.md) — explicação do app para quem não é
  programador: onde mudar textos, como funciona o login, onde ficam os dados, o que fazer se
  o app cair e como fechar/abrir o acesso de um comprador.

## Como este template é usado pela skill `/app-da-vsl`

Este repositório é um template genérico. Para virar o app de um produto específico, a skill
`/app-da-vsl` só mexe em `app.config.json` — nome do app, cores do tema (`theme`), identidade
visual (`identity`: clima, fontes, símbolo e ilustração) e módulos do produto — e depois roda
`npm run icones` para regerar os ícones do PWA com a nova identidade; nenhum código do app é
alterado nesse processo. Depois de publicado, o dono ainda pode ajustar cores e identidade
pelo próprio painel (**Painel → Conteúdo**), sem precisar da skill — só o ícone instalado no
celular exige rodar a skill de novo para refletir uma troca de símbolo.
