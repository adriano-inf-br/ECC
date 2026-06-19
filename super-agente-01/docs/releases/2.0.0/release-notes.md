# ECC 2.0.0 — O Sistema Operacional de Harness para Agents

ECC 2.0.0 é a graduação estável da linha 2.0: ECC como um sistema operacional cross-harness para trabalho agentic. Claude Code permanece como primeira classe; Codex, OpenCode, Cursor, Gemini, Zed e fluxos de trabalho exclusivos de terminal compartilham as mesmas skills, rules, hooks, convenções MCP, gates de lançamento e fluxos de trabalho de operador.

## Destaques

- 261 skills públicas entre programação, pesquisa, segurança, mídia, operações empresariais e fluxos de trabalho de agent.
- Substrato do painel de controle ECC 2.0: adaptadores de sessão neutros ao harness (`ecc.session.v1`) cobrindo Claude Code, Codex, OpenCode e dmux.
- Inventário MCP (`ecc.mcp.v1`): uma visualização normalizada de configurações de servidor MCP entre harnesses, com detecção de fragmentação e drift e redação de secret.
- Serviço de lifecycle de worktree: previsão determinística de conflito e coleta de lixo segura para worktrees paralelas de agent.
- Família de skills de orquestrador `orch-*` mais orquestração dinâmica de equipe de fluxo de trabalho.
- Pacote de otimização derivado de rollout: `parallel-execution-optimizer`, `benchmark-optimization-loop`, `data-throughput-accelerator`, `latency-critical-systems`, `recursive-decision-ledger`.

## Hardening desde rc.1

Aproximadamente trinta PRs de correções chegaram entre rc.1 e o estável. Os que vale conhecer:

- **Hooks de plugin eram silenciosamente no-ops no Node 21+** (#2184). O runner de hook dependia de `require.main` sob `node -e`, que versões mais recentes do Node deixam indefinido — cada hook de plugin saía de forma limpa sem executar. Se você estiver no Node 21 ou mais recente, atualize agora.
- Confiabilidade no Windows: normalização de caminho de `CLAUDE_PLUGIN_ROOT` (#2139), prompts passados via stdin para que o shell não os distorça (#2174), proteções de teste para symlinks quebrados e chmod (#2171, #2176).
- Segurança: credenciais de curl mantidas fora do argv (#2175), gateguard agora bloqueia checkouts de força/caminho como destrutivos (#2158) com knobs de ambiente para aprovação de comandos de rotina (#2161), hardening de entrada de advisory.
- Correção: sumários de fim de sessão não corrompem mais sequências `$` em mensagens de usuário (#2180), a detecção de projeto corresponde chaves de pacote em limites para que `preact` não seja mais lido como `react` (#2181), lacunas de empacotamento do manifesto de instalação fechadas (#2172), shims de comando legado corrompidos truncados com segurança (#2167).
- Padrões mais enxutos: superfície de instalação do OpenCode menor com hooks-runtime aprovado (#2140), `rules/zh` fora da instalação padrão sempre carregada (#2170).
- Novas superfícies: skill `kubernetes-patterns` (#2178), serviço de lifecycle de worktree (#2164), inventário MCP (#2146), adaptadores de sessão codex-worktree e opencode (#2145), a família `orch-*` (#2153).

## Lançamento da Comunidade

O Discord do ECC está ao vivo: <https://discord.gg/36yGMHGFbR>

- Notícias de lançamento chegam em #announcements, postadas automaticamente e fixadas pelo fluxo de trabalho de lançamento disponibilizado neste mesmo lançamento (#2201).
- Um feed ao vivo de PR e issues roda em #pr-and-issues.
- O bot ECC responde a lookups de `/skill`, `/docs` e `/release` no servidor.
- #feedback e #feature-requests são lidos diretamente pelo mantenedor e moldam o roadmap.

## Instalar ou atualizar

```
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc
```

Instalações existentes: `/plugin update ecc`

Changelog completo: <https://github.com/affaan-m/ECC/compare/v2.0.0-rc.1...v2.0.0>
