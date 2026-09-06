# App da VSL — manual pra quem vai usar

## O que você precisa ter (uma vez só)
1. **Claude Code** instalado e funcionando neste computador.
2. **Conta na Hostinger** com o **conector da Hostinger ligado no Claude Code**, e um destes
   dois lugares pro app morar:
   - um **plano de hospedagem Business** (ou superior) — é o caminho da aula 1, e o app
     ganha um endereço grátis `.hostingersite.com`; ou
   - uma **VPS** (KVM 1 serve) — é o caminho da aula 2, onde vários apps moram na mesma
     máquina. Aqui você precisa também de um **domínio seu** pra dar endereço a cada app.
     Se for criar a VPS agora, escolha o modelo **"Ubuntu 24.04 with Docker"** — o modelo
     "with Claude Code" não serve pra publicar o app.
   Se você tiver os dois, a ferramenta pergunta uma vez onde publicar. Se tiver só um, ela
   nem pergunta.
3. **Conta no GitHub** e o programa `gh` logado (`gh auth login`), pra guardar o código do seu app.
4. Homebrew (instalador de programas do Mac). O resto a skill instala sozinha e te avisa.

## Como usar
Mande pro Claude Code, numa frase, o link da página da VSL (ou o arquivo do vídeo, ou a transcrição) e o e-mail que vai ser o dono do app:

> Transforma essa VSL em app: <link>. O dono é meu@email.com.

Aí é esperar. A skill transcreve, analisa, decide a identidade, escreve todo o conteúdo, monta, testa em telas de celular, publica e te entrega um link. Ela não vai te perguntar coisas de design ou de programação; ela decide. Leva de 40 minutos a 2 horas dependendo do tamanho da VSL.

## O que você recebe
- O link do app (abra no celular) e o link do painel do dono, com e-mail e PIN.
- O texto pronto pra colar na página de obrigado e no e-mail da plataforma.
- Um documento (`03-entrega.md`) com o que tem dentro, o que é exemplo, e como fechar o acesso só pra compradores quando quiser (webhook).

## Depois
- Textos, cores e identidade você muda no painel, sem código.
- Quer domínio próprio? Conecte na Hostinger o domínio ao site criado (a skill deixa o nome do site no documento).
- Achou algo errado? Diga pro Claude Code o que é e onde; ele ajusta e republica.

## Se o seu app está numa VPS
- Cada app fica num endereço tipo `nomedoapp.seudominio.com`. O certificado de segurança
  (o cadeado) aparece sozinho, em alguns minutos.
- Dá pra colocar vários apps na mesma VPS. Cada um tem o banco de dados dele, separado.
- A VPS tem que ter sido criada com o modelo **"Ubuntu 24.04 with Docker"**. O modelo
  "with Claude Code" não vem com o motor que roda os apps.
- Se algum app parar, fale com o Claude Code: ele lê o que aconteceu e reinicia, sem você
  entrar em servidor nenhum.
