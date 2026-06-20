---
name: frontend-design-direction
description: Define uma direção de design Frontend específica para ECC em trabalhos de UI de produção. Use ao construir ou melhorar websites, dashboards, aplicações, componentes, landing pages, ferramentas visuais ou qualquer UI web que precise de um julgamento de design mais forte e específico ao produto.
metadata:
  origin: community
---

# Direção de Design Frontend

Use esta skill quando o trabalho não for apenas fazer a UI funcionar, mas fazê-la
parecer intencional, polida e adequada ao domínio do produto.

Fonte: recuperada da PR comunitária obsoleta #1659 por `linus707`.

Nota: o ECC intencionalmente não reempacota a skill canônica `frontend-design` da Anthropic.
Instale-a a partir de `anthropics/skills` quando quiser a skill upstream oficial. Esta skill
é a salvaguarda de orientação de design específica ao ECC com a orientação local útil da #1659.

## Quando Usar

- O usuário pede para construir uma página web, app, dashboard, artefato, componente ou UI.
- O usuário pede para tornar uma interface mais polida, distintiva, bela ou
  menos genérica.
- A implementação precisa de hierarquia visual, tipografia, cor, movimento, layout
  e escolhas de interação.
- A UI atual funciona, mas parece plana, genérica, baseada em template ou inadequada
  ao público-alvo.

## Direção de Design

Antes de codificar, escolha uma direção específica:

1. Propósito: qual tarefa a interface realiza?
2. Público: quem repete este fluxo de trabalho e o que precisa ver primeiro?
3. Tom: utilitário, editorial, lúdico, industrial, refinado, técnico,
   maximal, minimal, denso, calmo ou outra direção explícita.
4. Detalhe memorável: uma ideia de design que faz o resultado parecer intencional.
5. Restrições: framework, acessibilidade, desempenho, responsividade e
   design system existente.

Adapte a direção ao domínio. Uma ferramenta de operações SaaS geralmente deve ser
densa, discreta e escaneável. Um portfólio, landing page, jogo ou peça editorial
pode ser mais expressivo. Não force uma composição de landing page em uma ferramenta
que precisa de uso diário repetido.

## Orientação de Implementação

- Construa a experiência utilizável real como primeira tela, a menos que o usuário
  peça explicitamente por cópia de marketing.
- Use componentes, tokens, bibliotecas de ícones e padrões de roteamento do projeto
  existente antes de introduzir um novo sistema visual.
- Use ativos visuais reais ou gerados quando a interface depende de imagens,
  produtos, lugares, pessoas, jogabilidade, gráficos ou mídia inspecionável.
- Prefira tipografia e espaçamento contextuais em vez de texto hero genérico e
  exagerado.
- Mantenha paletas multidimensionais: evite uma UI dominada por uma família de cor.
- Use variáveis CSS ou tokens de design existentes para que a direção permaneça
  coerente entre os estados.
- Projete restrições responsivas explicitamente: grids, proporções de aspecto, tamanhos
  min/max, barras de ferramentas estáveis e controles de formato fixo não devem se
  deslocar quando rótulos ou estados de hover aparecem.
- Use movimento com moderação, mas de forma deliberada. Prefira transições de alto
  sinal que esclareçam o estado em vez de animação decorativa.
- Verifique o ajuste do texto em mobile e desktop. Rótulos longos devem quebrar ou
  redimensionar de forma limpa em vez de transbordar.

## Anti-Padrões

- Não recorra a padrões gerados comuns: gradientes roxos, blobs decorativos,
  cards exageradamente grandes, cópias hero vagas ou mídia atmosférica de stock.
- Não adicione cards dentro de outros cards.
- Não use um único estilo decorativo em todos os lugares quando o domínio exige
  contenção.
- Não esconda o produto, ferramenta, objeto ou fluxo de trabalho principal atrás de
  seções genéricas de marketing.
- Não adicione uma nova dependência por um elemento decorativo de design a menos que
  ela claramente se justifique.
- Não descreva as funcionalidades da UI dentro da UI quando os controles podem falar
  por si mesmos.

## Lista de Verificação de Revisão

- O primeiro viewport comunica imediatamente o produto, fluxo de trabalho ou objeto.
- A hierarquia visual suporta escaneamento e uso repetido.
- A tipografia se ajusta ao contêiner e não sobrepõe o conteúdo adjacente.
- As escolhas de cor têm contraste e não colapsam em uma paleta monótona.
- Ícones são usados para ações de ferramentas familiares quando disponíveis.
- O layout responsivo tem dimensões estáveis para boards, grids, barras de ferramentas,
  controles, tiles e contadores.
- Os ativos renderizam e transportam o assunto em vez de agir como preenchimento.
- O movimento melhora a orientação e não mascara lentidão.
- O resultado corresponde às convenções Frontend existentes do repositório, a menos que
  haja uma razão clara para se afastar.
