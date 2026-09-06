# Brief de conteúdo — o que a skill (ou o agente que ela usar) tem que produzir

O conteúdo é o que faz o comprador sentir que valeu. Regras fixas, depois faixas por família.

## Regras fixas
- **Idioma:** o da VSL. Tudo: dias, aulas, guias, lembretes, textos de avaliação.
- **Voz:** segunda pessoa, direta, calorosa, sem exclamações em série, sem emoji, sem jargão sem explicação.
- **Nada de copy de venda:** sem comparação com concorrente/remédio, sem número de resultado como promessa, sem medo, sem "segredo revelado".
- **Área sensível** (saúde, dinheiro, fé, relacionamento, jurídico): baseado em fontes públicas reconhecidas (órgãos oficiais, universidades, revisões científicas, textos canônicos no caso de fé), sem dose, sem remédio, sem alavancagem, sem promessa de retorno, sem contrariar orientação profissional. Frase de aviso (`app.notice`) no idioma: saúde → "Se você tem alguma condição de saúde ou usa medicação, mostre este protocolo ao seu médico."; dinheiro → "Nada aqui é recomendação de investimento. Decida com informação e, se precisar, com um profissional."
- **Sem placeholder:** nenhum "[preencher]", "em breve", "exemplo". Links externos só se forem reais e https; senão, o conteúdo vai escrito dentro do app.
- **Nomes da VSL** mantidos: o método, a "IA", o protocolo, os bônus (o comprador reconhece).
- **JSON seguro:** markdown só em corpos de aula, passos de guia, textos copiáveis e páginas.

## Faixas mínimas
| Bloco | Mínimo |
|---|---|
| Protocolo | 21 a 90 dias (o que a VSL promete; se não diz, 30). Cada dia: título, 2-4 tarefas, 1 dica de uma frase. Fases com prefixo `Fase N · `. Tarefas fixas diárias quando o mecanismo tem uma prática central. |
| Aulas | 4-5 seções, 8-12 aulas, 300-600 palavras cada, markdown com `##`, listas, parágrafos curtos, checklist de 2-3 itens. Bônus da VSL viram seções/aulas. |
| Guias | ≥ 8 no total quando o mecanismo tem receitas/rotinas/scripts; ≥ 4 caso contrário. Lista com ≥ 3 seções e quantidades; receitas com tempo, porções, 4-8 ingredientes, 3-6 passos, dica; passos com 5-9 etapas (minutos quando é rotina); textos copiáveis com 3-8 blocos; páginas com 2-5 seções. |
| Medição | 1 métrica principal com unidade real e faixa plausível; 1 contador quando há hábito contável (água, minutos, páginas, contatos). |
| Lembretes | 3-5, horários coerentes com a rotina proposta. |
| Avaliação | Calculadora: `explanation` é TEXTO PURO (sem markdown, sem `**`), no máximo 90 palavras, fala com a pessoa e termina dizendo por onde começar;  3-6 entradas com min/max/default e fórmula que faz sentido; texto de resultado que fala com a pessoa. Quiz: 4-8 perguntas × 3-4 opções, 3-4 perfis com `ajustes` em markdown (o que muda pra esse perfil). |
| Conquistas | Vêm do template (marcos do protocolo); nada a escrever. |

## Por família de mercado (exemplos do que "ferramentas" significa)
- Saúde/alimentação: receitas, lista de compras, guia do preparo semanal, protocolo de rotina.
- Fitness: treinos do dia como passos (com minutos), lista de material, aquecimento/alongamento.
- Finanças/renda: scripts de abordagem (texto), passos (abrir conta, primeira operação), planilha descrita como página, calculadora de meta.
- Prosperidade/fé: afirmações e orações (texto copiável), rotina matinal (passos com minutos), meditações (áudio só com URL real; senão roteiro em texto), diário.
- Relacionamento: "o que dizer" (texto), a conversa difícil (passos), desafio de dias.
- Hobby/habilidade: primeiros passos (passos), material (lista), cifras/receitas/padrões (texto/página), plano de prática (protocolo), minutos praticados (contador).
- Produto físico/serviço: guia de uso/instalação (passos), o que preparar (lista), acompanhamento (protocolo).

## Checagem antes de gravar
Contar: dias com dica = total; aulas na faixa de palavras; guias ≥ mínimo; zero "http://"; zero placeholder; aviso presente se área sensível; idioma consistente (amostra de 10 strings).
