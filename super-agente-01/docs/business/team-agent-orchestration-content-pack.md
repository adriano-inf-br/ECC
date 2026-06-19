# Pacote de Conteúdo de Orquestração de Agentes em Equipe

Este pacote transforma a direção atual do ECC em ideias publicáveis sem expor fontes de
pesquisa privadas. A afirmação central: as ferramentas de agentes estão migrando de janelas
de chat individuais para sistemas de orquestração de equipes com boards, painéis de controle,
fluxos de trabalho dinâmicos, gates de eval e skills compartilhadas.

## Posicionamento

O ECC deve ser enquadrado como uma camada de orquestração e plano de controle para a pilha
multi-agente. O ponto não é "mais uma biblioteca de prompts." O ponto é um sistema operacional
de fluxo de trabalho para equipes que usam Claude Code, Codex, OpenCode, desktops no estilo
Hermes, painéis de terminal, agentes de navegador, gateways MCP e ferramentas de agentes
internas ao mesmo tempo.

## Tese Narrativa

A geração antiga de Kanban de agentes falhou porque os agentes não eram confiáveis o
suficiente para ter cartões reais. Eles alucinavam contexto, pulavam verificações e produziam
saídas que não podiam ser mescladas. A nova geração pode funcionar porque fluxos de trabalho
dinâmicos, modelos de código mais fortes, harnesses de eval, estado local, controle de
navegador e a padronização MCP tornam cada cartão observável e passível de gate.

## Conceitos de Vídeo

### 1. Por Que o Kanban de Agentes Falhou, e Por Que Pode Funcionar Agora

- Hook: "O Kanban de agentes costumava ser teatro. Agora pode se tornar a superfície de operação."
- Mostrar: um cartão movendo-se do backlog para em execução, para revisão, para mesclado.
- Pontos-chave:
  - Cartões precisam de proprietários, branches, evals e gates de merge.
  - Fluxos de trabalho dinâmicos permitem que os agentes criem harnesses locais de tarefas.
  - Painéis de controle transformam saídas ocultas de chat em estado operacional.
- CTA: "Pare de perguntar se os agentes podem programar. Pergunte se sua equipe pode rotear,
  verificar e mesclar o trabalho dos agentes."

### 2. O Painel de Controle É a Nova Primitiva de IDE

- Hook: "O próximo IDE não é um editor de texto. É uma superfície de controle de missão."
- Mostrar: sessões, itens de trabalho, memória, conectores, ações e prontidão de merge.
- Pontos-chave:
  - As equipes executarão múltiplos harnesses ao mesmo tempo.
  - O produto vencedor coordena contexto, ferramentas e evidências.
  - Apps de desktop importam quando tornam o estado inspecionável, não quando adicionam mais
    uma caixa de chat.
- CTA: "Construa o painel que diz o que os agentes estão fazendo, o que falhou e o que pode
  ser enviado."

### 3. Um Harness Para Cada Tarefa

- Hook: "O agente não deve apenas escrever código. Deve construir o fluxo de trabalho que
  prova que o código funciona."
- Mostrar: um fluxo de trabalho dinâmico criando testes, smoke no navegador e artefatos de
  handoff.
- Pontos-chave:
  - Fluxos de trabalho estáticos são bons padrões.
  - Fluxos de trabalho dinâmicos são harnesses locais de tarefas.
  - Fluxos de trabalho dinâmicos repetidos se tornam skills compartilhadas.
- CTA: "O ativo real é o fluxo de trabalho reutilizável, não a resposta pontual."

### 4. Gateways MCP e o Fim de Reconfigurar Cada Agente

- Hook: "Se você configura cada servidor MCP dez vezes, sua pilha de agentes já está
  quebrada."
- Mostrar: um registro de ferramentas alimentando múltiplos harnesses.
- Pontos-chave:
  - As ferramentas devem ser declaradas centralmente e aplicáveis localmente.
  - O painel de controle deve mostrar a saúde do conector.
  - A portabilidade do agente depende de contratos de ferramentas compartilhados.
- CTA: "Trate ferramentas como infraestrutura, não como configurações por chat."

### 5. As Equipes Vão Funcionar Como Laboratórios de IA

- Hook: "Toda empresa se torna um laboratório de IA quando cada fluxo de trabalho tem um
  eval."
- Mostrar: um fluxo de trabalho de negócios com um avaliador de aprovação/falha e uma fila
  de itens de trabalho.
- Pontos-chave:
  - Os gates de eval movem o trabalho dos agentes de demonstração para operações.
  - Skills compartilhadas são arquivos de melhores práticas da equipe.
  - O painel de controle é onde a gestão vê throughput e risco.
- CTA: "O futuro não é um agente. É uma equipe avaliada de agentes."

## Ângulos de Artigo

### 1. O Kanban de Agentes Foi Precoce, Não Errado

Argumento:

- O Kanban para agentes falhou quando os cartões eram apenas prompts.
- Começa a funcionar quando os cartões carregam propriedade, escopo de branch, testes, evals
  e handoff.
- Fluxos de trabalho dinâmicos permitem que cada cartão gere seu próprio harness de prova.
- Um painel de controle torna o board honesto porque mostra estado do sistema de arquivos,
  testes e sessões.

Seções sugeridas:

1. Por que o Kanban de agentes inicial parecia falso.
2. O que mudou: melhores modelos, fluxos de trabalho dinâmicos, MCP, estado local, automação
   de navegador.
3. O esquema mínimo viável de cartão.
4. Por que gates de merge importam mais do que atribuição de tarefas.
5. O que as equipes devem construir agora.

### 2. A Era do Painel de Controle no Desenvolvimento de IA

Argumento:

- A próxima superfície do desenvolvedor é um painel de controle que coordena agentes,
  ferramentas, memória e gates.
- O chat permanece como a camada de interação, mas o valor do produto vive no estado de
  orquestração.
- O ECC deve ser posicionado como a camada compartilhada entre harnesses locais, agentes de
  desktop e sistemas de equipe.

Seções sugeridas:

1. O chat não é suficiente para o trabalho em equipe.
2. Sessões, memória, ferramentas e itens de trabalho precisam de um painel.
3. Fluxos de trabalho dinâmicos precisam de visibilidade.
4. Painéis de controle se tornam o fosso do produto.
5. A distribuição open-source vem de se tornar infraestrutura.

### 3. Skills Compartilhadas São os Novos Playbooks da Equipe

Argumento:

- As melhores empresas não vão depender de cada engenheiro inventando seu próprio fluxo de
  trabalho de agente.
- Um arquivo de skill compartilhado é o novo documento de melhores práticas, mas executável
  por agentes.
- Fluxos de trabalho dinâmicos são descoberta; skills são memória institucional.

Seções sugeridas:

1. Por que a divergência da equipe no uso de agentes é cara.
2. O que pertence a uma skill.
3. Quando promover um harness local de tarefa.
4. Como os evals mantêm as skills compartilhadas honestas.
5. Como isso se torna uma camada de plataforma.

## Posts Curtos

1. O Kanban de agentes não falhou porque o board estava errado. Falhou porque os cartões não
   tinham propriedade, eval, branch ou gate de merge. A nova primitiva não é "atribuir prompt
   a agente." É "atribuir item de trabalho verificado a equipe de agentes."

2. Fluxos de trabalho dinâmicos mudam a unidade de reutilização. A resposta é descartável. O
   harness é valioso. Se o mesmo harness local de tarefa funcionar duas vezes, promova-o para
   uma skill compartilhada.

3. O painel de controle é onde o trabalho dos agentes se torna visível para a gestão: quem
   tem o cartão, o que mudou, o que falhou, o que passou e o que pode ser mesclado.

4. O próximo ponto de entrada OSS para infraestrutura de agentes parece com os pontos de
   entrada de infraestrutura antigos: tornar-se a coisa que as equipes instalam primeiro
   porque padroniza ferramentas, fluxos de trabalho, evidências e handoff.

5. As equipes não vão executar um agente. Vão executar squads avaliados de código, navegador,
   dados, revisão e conteúdo. A camada do produto é orquestração.

## Plano de Distribuição

1. Publicar um post curto sobre Kanban de agentes.
2. Seguir com um vídeo de 90 segundos mostrando um cartão movendo-se por um painel de controle.
3. Publicar o artigo sobre skills compartilhadas como playbooks da equipe.
4. Lançar um clipe de demonstração do painel de controle ECC mais um cartão de fluxo de
   trabalho dinâmico.
5. Transformar comentários na próxima skill ou artigo.

## Implicações do Produto para o ECC

- Construir skills primeiro; comandos são shims de compatibilidade.
- Fazer o painel de controle mostrar itens de trabalho, estado do Kanban de agentes, gates
  e candidatos a skills reutilizáveis.
- Tratar fluxos de trabalho dinâmicos como um sistema alimentador para skills compartilhadas.
- Tratar a configuração de MCP e conector como infraestrutura que deve ser visível entre
  harnesses.
- Manter a pesquisa privada privada; publicar conceitos sintetizados e evidências de produto.
