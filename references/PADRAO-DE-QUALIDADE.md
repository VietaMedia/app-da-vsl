# App da VSL — Padrão de Qualidade (regra da skill, sem portão)

Aprovado por ele em 2026-09-05 a partir dos mockups em `design/v2-referencia/` (artefato
"Programa Active v2"). **Este é o nível mínimo de entrega.** A skill não pergunta, não mostra
mockup, não pede aprovação: entrega o app pronto e publicado nesse padrão. O mentorado avalia depois.

## 1. Princípio

O app é a **promessa da VSL entregue em forma de produto**. Tudo que a VSL promete que "o app faz"
tem que existir, com conteúdo completo dentro, bonito e brutalmente intuitivo. Nada de PDF, nada de
"a preencher", nada de tela vazia.

## 2. Acesso

- Entrada **só com e-mail**. Sem senha, sem "criar conta", sem confirmação por e-mail.
- Frase obrigatória na tela de entrada: **"Utilize o e-mail da sua compra para acessar o aplicativo."**
- Sessão lembrada no aparelho por 90 dias, **sem dizer isso ao comprador** (ele entenderia como prazo de uso). Botão único: "Entrar no meu programa".
- **Nenhum aviso sobre senha ou prazo** na tela de entrada: só a frase obrigatória, o campo e o botão.
- Primeiro acesso cai na **avaliação guiada** (uma pergunta por tela). Acessos seguintes caem em **Hoje**.

## 3. Identidade visual por nicho (gerada pela skill)

| Elemento | Regra |
|---|---|
| Paleta | 1 cor primária escura + 1 primária + 1 acento quente + 1 fundo tonalizado (nunca branco puro) + 1 fundo secundário + tinta escura tonalizada. Brancos com saturação baixíssima. |
| Tipografia | Par: display com personalidade (serifa editorial ou grotesca marcante) + interface amigável e legível. Nunca Inter/Roboto/Arial. Via Google Fonts com fallback. |
| Ícone do app | Símbolo do nicho desenhado em SVG (não iniciais), fundo em gradiente da primária, detalhe no acento. Gera 192/512/apple-touch. |
| Ícones de interface | SVG inline, traço, grade 24, um único estilo. Nunca emoji como ícone. |
| Ilustração | SVG de linha, grande e translúcido, como textura nos cabeçalhos (folha, onda, engrenagem…). |
| Clima | Definido pelo nicho: natural/cozinha, clínico/limpo, fitness/energia, financeiro/sóbrio, beleza/suave, produtividade/foco. Muda raio de canto, sombra, textura e tom das frases. |

Exemplo aprovado (saúde natural): verde-escuro `#1F4A28`, verde-folha `#2F6B3A`, terracota
`#E07A2F`, creme `#FBF7F0`, creme escuro `#F3EBDD`, tinta `#1F2A1F`; Cormorant Garamond + Nunito Sans.

### 3.1 Como a skill decide a identidade (ordem de prioridade)

Hoje (piloto) a identidade foi decidida à mão, olhando os quadros do vídeo. Na skill, é um passo
próprio, com três fontes em ordem de prioridade e um validador no fim:

1. **Marca existente** (quando houver): cores da página de vendas (CSS/logo), logo do produto, embalagem
   mostrada no vídeo. Se existe marca, o app respeita a marca.
2. **Quadros da VSL**: a skill já extrai um quadro por minuto. Ela calcula as cores dominantes do
   cenário e do expert (mato/cozinha → verdes e terrosos; consultório → azuis e brancos; academia →
   pretos e cores vivas; escritório → azul-marinho e dourado) e propõe primária e acento a partir daí.
3. **Banco por mercado** (`identidade/banco-por-mercado.md` na skill): uma família de paletas, par de
   fontes, símbolo, ilustração e clima por mercado, usado quando 1 e 2 não bastam e sempre como
   **validador** do que saiu de 1 e 2 (ex.: nunca rosa-choque num app clínico; nunca verde-hospital num
   app de prosperidade).

| Mercado | Paleta-base | Fontes (display + interface) | Símbolo | Clima |
|---|---|---|---|---|
| Saúde natural, alimentação | verde-folha + terracota + creme | Cormorant Garamond + Nunito Sans | bowl / leaf | natural |
| Clínico, emagrecimento médico, sono | azul-petróleo + verde-água + off-white frio | Playfair Display + Source Sans 3 | pulse / drop | clinico |
| Fitness, treino, performance | grafite + laranja ou verde-limão + cinza-claro | Bebas-like (Anton) + Manrope | dumbbell | fitness |
| Finanças, renda extra, negócios | azul-marinho + dourado + marfim | Libre Baskerville + IBM Plex Sans | coin | financeiro |
| Prosperidade, espiritualidade, fé | roxo-profundo ou azul-noite + dourado + areia | Cormorant Garamond + Nunito Sans | sun / star | calmo |
| Relacionamento, autoestima | vinho ou rosa-antigo + pêssego + creme | Fraunces-like (Lora) + Nunito Sans | heart | suave |
| Beleza, pele, cabelo | nude + terracota-clara + branco quente | Cormorant Garamond + Poppins | sparkles (ilustração) / star | beleza |
| Educação, hobby, habilidade | azul-royal ou verde-escuro + amarelo + papel | DM Serif Display + Inter-like (usar Manrope) | book | foco |
| Produtividade, foco, mente | azul-noite + ciano suave + cinza-quente | Space Grotesk + Manrope | brain | foco |

Regras que valem sempre: cores em oklch com mesma luminosidade/croma entre os acentos; fundo tonalizado
(nunca branco puro); contraste mínimo 4,5:1 do texto sobre o fundo e 3:1 do texto sobre a primária
(a skill mede e ajusta a luminosidade até passar); nunca Inter/Roboto/Arial; símbolo escolhido pelo
**mecanismo** (receita → bowl, plano → leaf/sun, dinheiro → coin, treino → dumbbell, estudo → book),
não pelo nicho. O briefing interno registra a fonte de cada decisão ("primária veio do cenário da
VSL, acento do banco por mercado").

## 4. Sensação premium (obrigatório)

- Cabeçalho de página com gradiente da primária, cantos inferiores arredondados (32 px), texto claro.
- Cartões brancos com borda sutil e sombra suave e larga (nunca sombra dura).
- **Cartões sempre com margem interna** (16 px; a classe `.card` já traz). Conteúdo nunca encosta na borda de um cartão. Toda tela nova é conferida em captura de 390/360/430 px antes da entrega.
- **Anel de progresso** animado no topo de Hoje (dia X de N) com acento.
- Animações: entrada em cascata (subida suave 0,5 s, atraso 120 ms entre blocos), transição entre
  abas, checkbox com preenchimento animado, confete discreto ao fechar o dia, contador que sobe.
  Leve: CSS + uma biblioteca pequena. Respeitar `prefers-reduced-motion`.
- Esqueleto de carregamento (blocos cinza pulsando) no lugar de "carregando...".
- Estados vazios com ilustração e uma frase que orienta a primeira ação.
- Micro-textos com voz humana e na segunda pessoa ("Boa manhã, Juliana", "Falta 1 pra fechar o dia").

## 5. Mobile primeiro

- Base 390 px de largura; testar 360 e 430. Área segura do iPhone (padding-bottom da barra).
- **Barra inferior fixa** com 5 abas: Hoje · Protocolo · Aulas · Kit · Eu. Ícone + rótulo, ativa na
  primária com traço mais grosso.
- Alvos de toque ≥ 44 px. Fonte de corpo ≥ 15 px. Inputs com 56 px de altura.
- Sem scroll horizontal. Listas com rolagem interna só quando fizer sentido (chips de semanas).
- PWA: manifesto completo, ícones, `theme-color`, tela de "instale o app" com instrução por sistema.

## 6. Features mínimas (dentro do mecanismo da VSL)

| Tela | O que tem |
|---|---|
| **Hoje** | Saudação com nome, data; anel "dia X de N" + fase + tema da semana + sequência; 2 cartões rápidos (métrica principal do nicho e um contador rápido, ex. água); lista das tarefas do dia com check; "próxima aula"; botão pra abrir o protocolo |
| **Avaliação guiada** | Passo a passo (uma pergunta por tela), barra de progresso, resultado com o cálculo do nicho, define meta e data de início; pode refazer em "Eu" |
| **Protocolo** | Fases com barra, chips de semanas, lista de dias com estado (feito / hoje / bloqueado), dia aberto com tarefas e dica |
| **Aulas** (trilha) | Capa por seção com ilustração, progresso, lista de aulas com estado, leitura confortável (tipografia, largura), checklist, botão "próxima aula" |
| **Kit** (guias) | Guias interativos: lista de compras por corredor com check e total estimado; receitas em cartão (ingredientes, passos, tempo); guias passo a passo com cronômetro. **Zero PDF.** |
| **Eu** | Progresso: semanas, sequência, gráfico da métrica com meta, conquistas (marcos do protocolo), diário de uma linha por dia, cartão de progresso pra compartilhar (imagem), refazer avaliação, lembretes, sair |
| **Painel do dono** | Padrão do template (usuários, uso, edição de textos) com o mesmo tema |

## 7. Conteúdo (gerado pela skill, completo)

- Protocolo com **todos os dias preenchidos** (título, 2-4 tarefas, dica curta). Fases e temas
  semanais derivados do mecanismo da VSL.
- Conteúdo de saúde/dinheiro/qualquer área sensível: **seguro e baseado em fontes públicas
  reconhecidas**, citadas no briefing interno; sem prescrever doses, remédios, jejum extremo, alavancagem.
- Aviso padrão em áreas de saúde: "Se você tem alguma condição de saúde ou usa medicação, mostre
  este protocolo ao seu médico."
- **A copy de venda não entra no app**: sem comparações com concorrentes/remédios, sem números
  de resultado como promessa. Voz de rotina e hábito.
- Nomes que a VSL usa ("IA", "método X", "protocolo Y") são mantidos na interface, porque é o que
  o comprador reconhece.
- Aulas: 5 seções, 8-12 aulas, cada uma 300-600 palavras em markdown, com checklist.
- Receitas/guias: mínimo 8 receitas ou guias com passos, tempo e ingredientes reais.

## 8. Fluxo da skill (sem parar)

checar → analisar VSL → briefing interno (não mostrado) → identidade → conteúdo completo →
config → build e testes → publicar (Hostinger) → smoke → **03-entrega.md** com link, painel e o
texto da página de obrigado. O mentorado abre o link no celular. Só então opina.

## 9. Mapeamento universal (por promessa, não por nicho) e regra de fallback

A skill nunca decide "esse nicho não dá". Ela decompõe **o que a VSL promete que o produto faz** em
seis famílias de entrega. Qualquer oferta é uma combinação delas:

| Família | Pergunta que a skill faz à VSL | Bloco do template |
|---|---|---|
| **Plano no tempo** | "Existe uma sequência de dias/semanas/passos que a pessoa segue?" (protocolo, desafio, novena, 21 dias, plano de treino, rotina) | `protocolo` (dias com tarefas e dica; fases) |
| **Conhecimento** | "O que a pessoa precisa entender pra funcionar?" (método, aulas, módulos, segredos revelados) | `trilha` (seções → aulas com checklist) |
| **Ferramentas e referências** | "O que ela consulta enquanto executa?" (receitas, listas, scripts, orações, afirmações, roteiros, templates, acordes, tabelas) | `guias`: `lista`, `receita`, `passos`, **`texto`** (conteúdo com botão copiar), **`audio`** (player) |
| **Medição** | "Qual número mostra que está funcionando?" (peso, saldo, dias sem X, minutos praticados, páginas lidas, copos) | `rastreador` (valor diário com meta) e `contador` (toque rápido) |
| **Personalização** | "A VSL promete algo 'sob medida' / 'seu perfil' / 'sua IA'?" | `calculadora` (avaliação numérica) e **`quiz`** (avaliação por alternativas → perfil e ramificação do conteúdo) |
| **Motivação e vínculo** | "O que faz ela voltar amanhã?" | sequência de dias, conquistas, diário de uma linha, lembretes, cartão de compartilhar |

Blocos em **negrito** são os que faltam no template hoje e entram antes da skill (Plano 2): `texto`,
`audio`, `quiz`, mais um **bloco livre** (`pagina`: conteúdo rico em markdown com ilustração e checklist)
que consegue expressar qualquer coisa que não caiba nos outros.

### Exemplos fora do óbvio

| VSL de… | Plano no tempo | Conhecimento | Ferramentas | Medição | Personalização |
|---|---|---|---|---|---|
| Prosperidade / lei da atração | 21 dias de rotina matinal (afirmação, visualização, gratidão) | o método em 5 aulas | textos: afirmações por área, roteiro de visualização; áudios: meditação guiada | dias seguidos; contador de minutos de prática; diário de gratidão | quiz: "qual crença te trava?" → afirmações diferentes |
| Religião / devocional | novena ou 40 dias; um passo por dia | ensinamentos por semana | textos: orações do dia, salmos, versículos pra copiar; áudios: oração narrada | dias seguidos; diário de intenções | quiz: "por qual intenção você reza?" → trilha diferente |
| Hobby (violão, pintura, horta, pesca) | plano de prática (15 min/dia, 30 dias) | aulas técnicas por nível | passos: afinar, primeira música, preparar a tela; listas: material; textos: cifras/receitas de tinta | minutos praticados; músicas/quadros concluídos (contador) | quiz: nível inicial → começa na aula certa |
| Renda extra / investimento | 30 dias de execução | o método | passos: abrir conta, primeira operação; textos: scripts de abordagem, mensagens prontas | saldo ou faturamento (rastreador com meta) | calculadora: meta mensal → quanto por dia |
| Relacionamento | desafio de 14 dias | as aulas do método | textos: o que dizer em cada situação (copiar); passos: a conversa difícil | diário; dias seguidos | quiz: seu padrão de apego → ajustes |
| Produto físico (gadget, suplemento, curso presencial) | protocolo de uso | como tirar o máximo do produto | passos de instalação/uso; lista do que precisa junto | o que o produto promete medir | avaliação de uso |
| Serviço feito por terceiros (agência, consultoria) | acompanhamento por etapas (o que acontece semana a semana) | o que o cliente precisa saber | textos: o que preparar, o que enviar | etapas concluídas | quiz de onboarding |

### Regra de fallback (a skill nunca trava)

1. Se uma promessa não cabe em nenhum bloco, ela vai pro **bloco livre** (`pagina`), com o conteúdo
   escrito por completo, nunca "em breve".
2. Se faltar um bloco de verdade (ex.: "galeria de fotos do progresso", "chat"), a skill entrega o app
   com o **equivalente mais próximo** (registro em texto + diário; contato por WhatsApp/e-mail na tela Eu)
   e registra a **lacuna** no `03-entrega.md`, em seção própria, com o que seria o bloco ideal. Quem
   mantém o template decide se o bloco entra.
3. A skill nunca deixa aba vazia: se a VSL não tem "conhecimento" (ex.: só uma receita), a aba Aulas
   some e as outras crescem; a barra inferior se adapta (mínimo Hoje e Eu).
4. Conteúdo sensível (saúde, dinheiro, fé, relacionamento) segue as regras de §7: seguro, baseado em
   fontes públicas, respeitoso, sem promessa de resultado e sem contrariar a orientação profissional.

### 9.1 Quando o mecanismo em si não pode ser construído

Algumas VSLs vendem um mecanismo que o app **não deve replicar**: sinais de operações financeiras,
apostas, "robô" de lucro garantido, cura de doença, produto que promete resultado médico, conteúdo
adulto. A skill não recusa o trabalho e não replica o mecanismo. Ela constrói **o equivalente
legítimo mais próximo que entrega a mesma transformação prometida**:

| A VSL promete | O app entrega |
|---|---|
| Sinais/robô que "copia traders" e rende X por dia | Plano de 30 dias de organização financeira e renda extra real; aulas de educação financeira (Banco Central, CVM, B3 Educação); calculadora de meta e de reserva; rastreador de saldo/faturamento; guias em passos (abrir conta, primeira renda extra); textos de negociação de dívida |
| Cura/remédio natural pra doença | Protocolo de hábitos com fontes de saúde pública; aviso médico; rastreador do sintoma/medida; receitas seguras |
| Conteúdo adulto / "truque" sexual | Não construir. Registrar no 03-entrega que a oferta não é elegível e por quê. |
| Aposta, jogo, "tigrinho" | Não construir. Idem. |

O `03-entrega.md` diz com clareza o que **não** foi construído e por quê, e o que o app entrega no
lugar. O nome e a "cara" da oferta (Renda Smart, Protocolo X) podem ficar, desde que o conteúdo
seja o legítimo.
