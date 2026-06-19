# Arquitetura Cross-Harness

ECC é a camada de fluxo de trabalho reutilizável. Harnesses são superfícies de execução.

O objetivo é manter as partes duráveis do trabalho agêntico em um único repositório:

- skills
- regras e instruções
- hooks onde o harness os suporta
- configuração MCP
- manifestos de instalação
- padrões de sessão e orquestração

Claude Code, Codex, OpenCode, Cursor, Gemini e harnesses futuros devem adaptar esses ativos
na borda, em vez de exigir um novo modelo de fluxo de trabalho para cada ferramenta.

Para a matriz de suporte voltada ao operador e o fluxo de trabalho de scorecard, veja
[Harness Adapter Compliance Matrix](harness-adapter-compliance.md).
Para o enquadramento da plataforma full-stack e o loop de integração de produto, veja
[ECC Platform Value Loop](platform-value-loop.md).

## Modelo de Portabilidade

| Superfície | Fonte Compartilhada | Adaptador de Harness | Status Atual |
|---------|---------------|-----------------|----------------|
| Skills | `skills/*/SKILL.md` | Plugin do Claude, plugin do Codex, `.agents/skills`, cópias de skill do Cursor, plugin/config do OpenCode | Suportado com empacotamento específico por harness |
| Regras e instruções | `rules/`, `AGENTS.md`, docs traduzidos | Instalação de regras do Claude, `AGENTS.md` do Codex, regras do Cursor, instruções do OpenCode | Suportado, mas não idêntico entre harnesses |
| Hooks | `hooks/hooks.json`, `scripts/hooks/` | Hooks nativos do Claude, eventos de plugin do OpenCode, adaptador de hook do Cursor | Baseado em hook no Claude/OpenCode/Cursor; baseado em instrução no Codex |
| MCPs | `.mcp.json`, `mcp-configs/` | Importação de configuração MCP nativa por harness | Suportado onde o harness expõe MCP |
| Comandos | `commands/`, scripts CLI | Comandos slash do Claude, shims de compatibilidade, entrypoints CLI | Suportado, mas a semântica de comandos varia |
| Sessões | `ecc2/`, adaptadores de sessão, scripts de orquestração | TUI/daemon, orquestração tmux/worktree, runners específicos por harness | Alpha |

## O Que Viaja Sem Alterações

`SKILL.md` é a unidade mais portátil.

Uma boa skill ECC deve:

- usar frontmatter YAML com `name`, `description` e `origin`
- descrever quando usar a skill
- declarar ferramentas ou conectores necessários sem embutir segredos
- manter os exemplos relativos ao repositório ou genéricos
- evitar suposições de comandos exclusivos do harness, a menos que a seção esteja claramente rotulada

A mesma skill fonte pode ser instalada em múltiplos harnesses porque consiste principalmente
em instruções, restrições e formato de fluxo de trabalho.

## O Que é Adaptado

Cada harness tem comportamento diferente de carregamento e aplicação:

- Claude Code carrega ativos de plugin e tem execução nativa de hook.
- Codex lê `AGENTS.md`, metadados de plugin, skills e configuração MCP, mas a paridade de hook é
  orientada por instrução.
- OpenCode tem um sistema de plugin/eventos que pode reutilizar a lógica de hook do ECC por meio
  de uma camada de adaptador.
- Cursor usa seu próprio layout de regras e hooks, por isso o ECC mantém superfícies traduzidas
  em `.cursor/`.
- O suporte ao Gemini é orientado por instalação/instrução e deve ser tratado como uma superfície
  de compatibilidade, não como paridade completa de hook.

Os adaptadores devem permanecer finos. O comportamento compartilhado pertence a `skills/`,
`rules/`, `hooks/`, `scripts/` e `mcp-configs/`.

## Fronteira Hermes

Hermes não é o runtime público do ECC.

Hermes é um shell de operador que pode consumir ativos do ECC:

- importar skills selecionadas do ECC para um diretório de skills do Hermes
- usar convenções MCP do ECC para acesso a ferramentas
- rotear fluxos de trabalho de chat, CLI, cron e handoff por meio de padrões ECC reutilizáveis
- destilar o trabalho local repetido do operador de volta em skills ECC higienizadas

O repositório público deve fornecer padrões reutilizáveis, não estado local do Hermes.

Deve ser fornecido:

- documentação de configuração higienizada
- prompts de demonstração relativos ao repositório
- skills gerais de operador
- exemplos que não dependem de credenciais privadas

Não deve ser fornecido:

- tokens OAuth ou chaves de API
- exportações brutas de `~/.hermes`
- memória de workspace pessoal
- conjuntos de dados privados
- pacotes de automação apenas locais que não foram revisados

## Exemplo Trabalhado

Use `skills/hermes-imports/SKILL.md` como a mesma fonte de skill entre harnesses.

O fluxo de trabalho é:

1. Criar o comportamento durável uma vez em `skills/hermes-imports/SKILL.md`.
2. Manter segredos, caminhos locais e memória bruta do operador fora da skill.
3. Deixar cada harness adaptar como a skill é carregada.
4. Testar a skill fonte e os metadados voltados ao harness separadamente.

Claude Code obtém a skill pela superfície de plugin do Claude e pode aplicar hooks
relacionados nativamente.

Codex lê as instruções do repositório, `.codex-plugin/plugin.json` e a configuração MCP de
referência. A mesma fonte de skill ainda descreve o fluxo de trabalho, mas a paridade de hook
é baseada em instrução, a menos que o Codex adicione uma superfície de hook nativa.

OpenCode obtém a skill pela superfície de pacote/plugin do OpenCode. O tratamento de eventos
pode reutilizar a lógica de hook do ECC pela camada de adaptador, enquanto o texto da skill
permanece inalterado.

Se uma mudança exigir editar três cópias do mesmo fluxo de trabalho em diferentes harnesses,
a fonte compartilhada está no lugar errado. Coloque o fluxo de trabalho de volta em `skills/`,
depois adapte apenas o carregamento, o formato de evento ou o roteamento de comandos na borda
do harness.

## Hoje vs. Mais Tarde

Suportado hoje:

- fonte de skill compartilhada em `skills/`
- empacotamento de plugin do Claude Code
- metadados de plugin do Codex e configuração MCP de referência
- superfície de pacote/plugin do OpenCode
- regras, hooks e skills adaptados para Cursor
- `ecc2/` como um plano de controle Rust em alpha

Ainda em maturação:

- paridade exata de hook entre todos os harnesses
- sincronização automatizada de skill para Hermes
- empacotamento de release para `ecc2/`
- semânticas de retomada de sessão cross-harness
- camadas mais profundas de memória e planejamento do operador
- o loop completo da plataforma onde produtos externos contribuem com pacotes de skills,
  APIs controladas, evals e estudos de caso de volta ao ECC

## Regra para Novos Trabalhos

Ao adicionar um fluxo de trabalho, coloque o comportamento durável no ECC primeiro.

Use arquivos específicos do harness apenas para:

- carregar o ativo compartilhado
- adaptar formatos de eventos
- mapear nomes de comandos
- lidar com limites da plataforma

Se um fluxo de trabalho funcionar apenas em um harness, documente essa fronteira diretamente.
