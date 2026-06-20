# Seleção de Superfície de Capacidade

Use este documento como guia de roteamento ao decidir se uma capacidade pertence a uma rule, uma skill, um servidor MCP ou um fluxo de trabalho simples de CLI/API.

O ECC não trata essas superfícies como intercambiáveis. O objetivo é colocar cada capacidade na superfície mais estreita que preserve a corretude, mantenha o custo de Token sob controle e não crie sobrecarga desnecessária de tempo de execução ou de cadeia de suprimentos.

## A Versão Resumida

- `rules/` são para restrições determinísticas e sempre ativas que devem ser injetadas quando um caminho ou evento corresponder.
- `skills/` são para fluxos de trabalho sob demanda, playbooks mais ricos e orientações que consomem muitos tokens e devem carregar apenas quando relevantes.
- `MCP` é para capacidades estruturadas e interativas que se beneficiam de uma superfície de ferramenta/recurso de longa duração entre sessões ou clientes.
- `CLI` local ou scripts de repositório são para ações determinísticas simples que não precisam de um servidor persistente.
- chamadas diretas de `API` dentro de uma skill são para ações remotas estreitas onde um servidor MCP completo seria mais pesado do que o problema.

## Ordem de Decisão

Faça estas perguntas em ordem:

1. Isto deve acontecer toda vez que um caminho ou evento corresponder, sem envolvimento de julgamento do modelo?
   - Use uma `rule`.
2. Isto é principalmente um playbook, fluxo de trabalho ou camada de orientação que deve carregar apenas quando a tarefa realmente precisar?
   - Use uma `skill`.
3. A capacidade precisa de uma interface de ferramenta/recurso estruturada e interativa que múltiplos harnesses ou clientes devam chamar repetidamente?
   - Use `MCP`.
4. É uma ação local simples que pode ser executada como um script sem manter um servidor ativo?
   - Use um ponto de entrada `CLI` local ou script de repositório e, se necessário, envolva-o com uma skill.
5. É apenas uma etapa estreita de integração remota dentro de um fluxo de trabalho maior?
   - Chame a `API` externa diretamente a partir da skill ou script.

## Orientação por Superfície

### Rules

Use rules para:

- invariantes de codificação com escopo de caminho
- pisos de segurança e restrições de permissão
- restrições de harness/tempo de execução que devem sempre se aplicar
- lembretes determinísticos que não devem depender da discrição do modelo

Não use rules para:

- playbooks extensos que sobrecarregariam toda edição correspondente
- fluxos de trabalho opcionais
- contexto de domínio caro que só importa às vezes

### Skills

Use skills para:

- fluxos de trabalho de múltiplas etapas
- orientação que exige julgamento
- playbooks de domínio suficientemente caros para carregar apenas sob demanda
- orquestração entre scripts, APIs, ferramentas MCP e skills adjacentes

Não use skills como depósito de invariantes estáticos que realmente desejam roteamento determinístico.

### MCP

Use MCP quando a capacidade se beneficiar de:

- entradas/saídas de ferramentas estruturadas
- recursos ou prompts reutilizáveis
- uso repetido entre clientes
- uma interface estável que deve funcionar em Claude Code, Codex, Cursor, OpenCode e harnesses relacionados
- um processo de servidor de longa duração que justifique a sobrecarga operacional

Evite MCP quando:

- o trabalho é um comando local de uso único
- a única coisa que o servidor faria é executar um shell uma vez
- o servidor adiciona mais carga de instalação/tempo de execução do que valor de produto

### CLI / Scripts de Repositório

Prefira um script local ou CLI quando:

- a ação é determinística
- a inicialização é barata
- o fluxo de trabalho é principalmente local
- não há benefício em expor uma superfície de ferramenta/recurso persistente

Esta é frequentemente a escolha certa para:

- wrappers de lint/test/build
- transformações locais
- pequenos instaladores
- geração de conteúdo que é executada uma vez por invocação

### Chamadas Diretas de API

Prefira chamadas diretas de API dentro de uma skill ou script existente quando:

- a integração é estreita
- a ação remota faz parte de um fluxo de trabalho maior
- você ainda não precisa de uma superfície de transporte reutilizável

Se a mesma integração remota se tornar central, repetida e multi-cliente, esse é o sinal para promovê-la a uma superfície MCP.

## Viés de Custo e Confiabilidade

Quando duas opções são igualmente viáveis:

- prefira a superfície de tempo de execução menor
- prefira a menor sobrecarga de Token
- prefira o caminho com menos partes móveis externas
- prefira o empacotamento nativo do ECC em vez de introduzir outra dependência de terceiros

Não normalize dependências externas de plugin ou pacote como superfícies ECC de primeira classe a menos que a capacidade justifique claramente a manutenção, segurança e carga de instalação.

## Política do Repositório

Ao trazer ideias de repositórios externos:

- copie a ideia subjacente, não a dependência externa
- reempacote-a como uma rule, skill, script ou superfície MCP nativa do ECC
- renomeie se a funcionalidade tiver sido materialmente expandida ou reformulada para o ECC
- evite entregar instruções que exijam que os usuários instalem pacotes de terceiros não relacionados, a menos que essa dependência seja intencional, auditada e central para o fluxo de trabalho

## Exemplos

- Um invariante de autenticação de backend que deve sempre se aplicar a edições em `api/**`:
  - `rule`
- Um playbook mais aprofundado de design de API e paginação:
  - `skill`
- Uma superfície de busca remota reutilizável usada entre múltiplos harnesses:
  - `MCP`
- Um analisador de repositório de uso único que lê arquivos locais e escreve um relatório:
  - `CLI` local ou script, opcionalmente envolvido por uma `skill`
- Uma única etapa de criação de sessão no portal de cobrança dentro de um fluxo de trabalho mais amplo de operações de clientes:
  - chamada direta de `API` dentro do fluxo de trabalho

## Heurística Prática

Se você não tiver certeza, comece menor:

- comece com uma `rule` para invariantes determinísticos
- comece com uma `skill` para orientação/fluxo de trabalho
- comece com um script para execução de uso único
- promova para `MCP` somente quando o limite estruturado do servidor estiver claramente se pagando
