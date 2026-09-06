# 03-entrega.md — modelo (no idioma da VSL quando for pro comprador; explicações pro dono no idioma do usuário)

## Links e acessos
| O quê | Valor |
|---|---|
| App (comprador) | https://<dominio> |
| Painel do dono | https://<dominio>/painel |
| E-mail do dono | |
| PIN do dono | (6 dígitos; só a conta do dono pede) |
| Repositório do app | (privado, no GitHub do usuário) |
| Capturas de tela | `apps/<slug>/capturas/` |

## Texto pra colar na página de obrigado e no e-mail de entrega
> **Seu acesso ao <Nome> está liberado.** 1. Abra pelo celular: <link>. 2. Digite o e-mail que você usou na compra e toque em "<botão>". 3. <primeiro passo: avaliação ou Dia 1>. 4. Pra ter o app na tela inicial: iPhone → Safari → Compartilhar → Adicionar à Tela de Início; Android → Chrome → menu → Instalar aplicativo.

## Como testar em 5 minutos
(Hoje, avaliação, protocolo, aulas, kit, eu, painel — um item por linha.)

## O que tem dentro
(Números reais: dias, aulas, guias, receitas, métrica, contador, lembretes, avaliação. Fontes públicas usadas.)

## O que é exemplo e precisa trocar antes de vender
(Links de vídeo das aulas; materiais do expert; áudios; e-mail de suporte.)

## Lacunas registradas
(O que a VSL prometia e o template não tem; o equivalente entregue; o bloco ideal.)

## Como funciona por dentro (linguagem simples)
PWA; `app.config.json`; painel muda textos/cores/identidade; acesso só e-mail, sessão lembrada; fechar o portão: webhook em `POST /api/acesso/liberar` + `ACESSO_FECHADO=1`; dados no MySQL da Hostinger; se cair: Node.js → Reiniciar; ícone instalado precisa de rebuild.

## Avisos
Site e banco criados pra este app; conteúdo gerado com fontes públicas (não é o material secreto do expert); verificado em navegador em 390/360/430 px; falta o teste no celular do usuário.
