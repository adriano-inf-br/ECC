# Política de Conectores MCP

O ECC disponibiliza exatamente um conector MCP padrão. Tudo o mais é uma skill envolvendo uma CLI ou REST API, ou uma entrada opt-in em `mcp-configs/mcp-servers.json`.

## A regra

Um conector padrão ganha seu espaço somente se ambos se aplicarem:

1. **Universal** — ele se aplica a essencialmente todo usuário de um agente de codificação, em todos os harnesses que o ECC suporta como target.
2. **MCP supera uma CLI/API envolta em uma skill** — o trabalho genuinamente precisa do que o MCP fornece: estado de sessão interativo, streaming, um handshake de auth ou navegação estruturada. Trabalho de requisição/resposta sem estado é uma skill, não um servidor. Schemas de ferramentas carregam em cada sessão; cada conector padrão taxa a janela de contexto de cada usuário, independentemente de usá-lo ou não.

O conjunto padrão fica bem abaixo de dez. Na prática, o padrão do campo em 2026 entre harnesses sérios é de zero a dois conectores mais os nativos integrados.

## Conjunto padrão atual

| Servidor | Por que passa |
|---|---|
| `chrome-devtools` | O MCP oficial do DevTools do Google. Sessões CDP interativas — depuração ao vivo, traces de desempenho, inspeção de console e rede em um navegador com estado. Este é o caso clássico em que o MCP supera uma CLI: o valor é a sessão mantida aberta, não um comando único. Sem chave. |

## Os seis que substituiu (auditoria de junho de 2026)

| Padrão anterior | Veredito | Substituto |
|---|---|---|
| `github` | substituir por skill | CLI `gh` via skill `github-ops`. O `gh` está nos dados de treinamento de todos os modelos, compõe comandos únicos com sobrecarga mínima de Token e autentica uma vez via `gh auth login`. Os ~30 schemas de ferramentas do servidor MCP taxavam cada sessão. |
| `context7` | substituir por skill | A skill `documentation-lookup` apontando para a REST API pública do Context7 (`/api/v2/libs/search`, `/api/v2/context`). Duas chamadas sem estado com uma chave bearer — sem estado de sessão para justificar um servidor. |
| `exa` | substituir por skill | Busca nativa do harness (WebSearch do Claude Code, web_search do Codex, @Web do Cursor) por padrão; a skill `exa-search` permanece para detentores de chave API. Também requeria uma chave API, o que falha no teste de universalidade para um padrão. |
| `memory` | remover completamente | Memória nativa do harness (diretórios de memória automática do Claude Code, memórias do Cursor, convenções de AGENTS.md) mais o sistema instinct/continuous-learning do ECC. O servidor de grafo de conhecimento resolveu um problema de 2024 que os harnesses já absorveram. |
| `playwright` | substituir por skill | A própria superfície de agent `@playwright/cli` da Microsoft — o próprio fornecedor moveu os fluxos de trabalho de agent para fora do MCP porque retornar árvores de acessibilidade completas por passo consome contexto. As skills e2e do ECC já usam a CLI. A *depuração* de navegador (o caso interativo) é coberta pelo `chrome-devtools`. |
| `sequential-thinking` | remover completamente | Pensamento estendido nativo em todos os harnesses modernos. O servidor não envolvia nenhum sistema externo — um padrão de prompt disfarçado de conector. |

Todos os seis permanecem disponíveis como entradas opt-in em `mcp-configs/mcp-servers.json` para usuários que os queiram.

## Opt-out

`ECC_DISABLED_MCPS` filtra as configs de MCP geradas pelo ECC no momento da instalação/sincronização:

```bash
export ECC_DISABLED_MCPS="chrome-devtools"
```

## Adicionando um conector

Abra um PR que argumente explicitamente ambos os requisitos da regra. "Popular" não é um argumento; "o trabalho é com estado e universal" é.
