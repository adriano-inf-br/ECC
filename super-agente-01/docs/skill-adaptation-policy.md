# Política de Adaptação de Skills

O ECC aceita ideias de repositórios externos, mas as skills disponibilizadas precisam se tornar
superfícies nativas do ECC.

## Regra Padrão

Quando uma contribuição começa a partir de outro repositório open-source, pacote de prompts, plugin, harness ou configuração pessoal:

- copie a ideia subjacente, fluxo de trabalho ou estrutura
- adapte-a às superfícies de instalação atuais do ECC, fluxo de validação e convenções de repositório
- remova branding externo desnecessário, suposições de dependência e enquadramento específico do upstream

O objetivo é reutilização sem transformar o ECC em um wrapper fino em torno do runtime de outra pessoa.

## Quando Manter o Nome Original

Mantenha o nome original da skill somente quando todos os itens a seguir forem verdadeiros:

- a contribuição é próxima de uma portagem direta
- o nome já é descritivo e neutro
- a superfície ainda se comporta como o conceito do upstream
- não há nenhum nome nativo do ECC melhor já no repositório

Exemplos:

- nomes de framework como `nestjs-patterns`
- nomes de protocolo ou produto que são o assunto, não o discurso de vendor

## Quando Renomear

Renomeie a skill quando o ECC expande, restringe ou reempacota significativamente o trabalho original.

Gatilhos típicos:

- O ECC adiciona comportamento, estrutura ou orientação substancialmente novos
- o nome original é orientado ao vendor ou à marca da comunidade em vez de ser orientado ao fluxo de trabalho
- a contribuição se sobrepõe a uma superfície ECC existente e precisa de um limite mais claro
- a contribuição agora se encaixa como uma capacidade, fluxo de trabalho de operador ou camada de política em vez de uma portagem literal

Exemplos:

- manter uma primitiva de grafo reutilizável como `social-graph-ranker`, mas tornar camadas de fluxo de trabalho mais amplas `lead-intelligence` ou `connections-optimizer`
- preferir nomes nativos do ECC como `product-capability` sobre rótulos de planejamento importados vagos se o escopo mudou materialmente

## Política de Dependências

O ECC prefere a superfície nativa mais restrita que realize o trabalho:

- `rules/` para restrições determinísticas
- `skills/` para fluxos de trabalho sob demanda
- MCP quando um limite de ferramenta interativa de longa duração é justificado
- scripts/CLI locais para execução determinística de uma só vez
- APIs diretas quando a chamada remota é restrita e não justifica MCP

Evite disponibilizar uma skill que exista principalmente para dizer aos usuários para instalar ou confiar em um pacote de terceiros não verificado.

Se a funcionalidade externa vale a pena manter:

- incorpore ou recrie a lógica relevante dentro do ECC quando prático
- ou mantenha a integração opcional e claramente marcada como externa
- nunca deixe uma nova dependência externa se tornar o caminho padrão sem justificativa explícita

## Perguntas de Revisão

Antes de fazer merge de uma skill contribuída, responda estas:

1. Esta é uma superfície reutilizável real no ECC, ou apenas documentação para outra ferramenta?
2. O nome atual ainda corresponde à superfície moldada pelo ECC?
3. Já existe uma skill ECC que possui a maior parte desse comportamento?
4. Estamos importando um conceito, ou importando a identidade de produto de outra pessoa?
5. Um usuário do ECC entenderia o propósito desta skill sem conhecer o repositório upstream?

Se essas respostas forem fracas, adapte mais, reduza o escopo, ou não disponibilize.
