# Matriz de Conformidade do Adaptador de Harness

Esta matriz é o ponto de entrada público para equipes que desejam usar o ECC em mais de
um harness de codificação. Ela transforma a arquitetura cross-harness em um scorecard
prático: o que funciona hoje, o que é apenas instrução, o que precisa de um adaptador e
quais evidências um operador deve coletar antes de confiar em uma configuração.

As unidades duráveis do ECC permanecem em fontes compartilhadas:

- `skills/*/SKILL.md`
- `rules/`
- `commands/`
- `hooks/hooks.json`
- `scripts/hooks/`
- configurações MCP de referência
- contratos de sessão e observabilidade

Os arquivos específicos do harness devem apenas adaptar o carregamento, o formato de eventos,
os nomes de comandos ou os limites da plataforma.

## Estados de Conformidade

| Estado | Significado |
| --- | --- |
| Nativo | O ECC pode instalar ou verificar a superfície diretamente para este harness. |
| Baseado em adaptador | O ECC tem um adaptador, plugin ou superfície de pacote fina, mas a paridade difere por harness. |
| Baseado em instrução | O ECC pode fornecer a orientação e os arquivos, mas o harness não expõe a superfície de hook/sessão em tempo de execução que o ECC precisa para aplicação. |
| Somente referência | A ferramenta é útil como pressão de design ou runtime externo, mas o ECC ainda não fornece um instalador ou adaptador direto para ela. |

## Matriz

A matriz abaixo é renderizada a partir de
`scripts/lib/harness-adapter-compliance.js` e verificada por
`npm run harness:adapters -- --check`.

<!-- harness-adapter-compliance:matrix-start -->
| Harness ou runtime | Estado | Ativos suportados | Superfícies não suportadas ou diferentes | Instalação ou onramp | Comando de verificação | Notas de risco |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | Nativo | Ativos de plugin do Claude; skills; comandos; hooks; configuração MCP; regras locais; fluxos de trabalho orientados a statusline | Hooks nativos do Claude não implicam paridade em outros harnesses | `./install.sh --profile minimal --target claude`; instalação do plugin do Claude | `npm run harness:audit -- --format json`; `node scripts/session-inspect.js --list-adapters` | Evitar carregar todas as skills por padrão; manter hooks opt-in e inspecionáveis. |
| Codex | Baseado em instrução | `AGENTS.md`; metadados de plugin do Codex; skills; configuração MCP de referência; padrões de comandos | A aplicação nativa de hook e a semântica de comandos slash do Claude não são equivalentes | `./install.sh --profile minimal --target codex`; revisão do `AGENTS.md` local do repositório | `npm run harness:audit -- --format json` | Tratar hooks como texto de política a menos que exista uma superfície de hook nativa do Codex. |
| OpenCode | Baseado em adaptador | Metadados de pacote/plugin do OpenCode; skills compartilhadas; configuração MCP; padrões de adaptador de eventos | Nomes de eventos, empacotamento de plugin e despacho de comandos diferem do Claude Code | Superfície de pacote ou plugin do OpenCode deste repositório | `node tests/scripts/build-opencode.test.js`; `npm run harness:audit -- --format json` | Manter a lógica de hook em scripts compartilhados e adaptar apenas o formato de evento na borda. |
| Cursor | Baseado em adaptador | Regras do Cursor; skills locais do projeto; adaptador de hook; scripts compartilhados | Eventos de hook do Cursor e carregamento de regras diferem do Claude Code | `./install.sh --profile minimal --target cursor` | `node tests/lib/install-targets.test.js`; `npm run harness:audit -- --format json` | Adaptadores do Cursor devem preservar as regras existentes do projeto e evitar sobreescrita silenciosa. |
| Gemini | Baseado em instrução | Instruções locais do projeto Gemini; skills compartilhadas; regras; documentos de compatibilidade | Sem paridade completa de hook do ECC; ports de ecossistema devem documentar a deriva do ECC upstream | `./install.sh --profile minimal --target gemini` | `node tests/lib/install-targets.test.js` | Tratar ports do Gemini como adaptadores de ecossistema até que sejam validados de ponta a ponta no Gemini CLI. |
| Zed | Baseado em adaptador | Configurações de projeto do Zed; regras de projeto niveladas; skills compartilhadas; comandos; agentes | Agentes externos do Zed e permissões nativas do Agent Panel não são hooks do Claude | `./install.sh --profile minimal --target zed` | `node tests/lib/install-targets.test.js`; `npm run harness:audit -- --format json` | Manter as configurações do projeto conservadoras e não copiar segredos BYOK/OpenRouter para `.zed/`. |
| dmux | Baseado em adaptador | Snapshots de sessão; status de orquestração tmux/worktree; exportações de handoff | dmux é um runtime de orquestração, não um alvo de instalação para skills/regras | `node scripts/session-inspect.js --list-adapters`; inspeção de alvo de sessão dmux | `node tests/lib/session-adapters.test.js` | Tratar eventos dmux como sinais de sessão/runtime, não como substituto para validação do repositório. |
| Orca | Somente referência | Ciclo de vida de worktree; estado de revisão; notificação; pressão de design de identidade do provedor | Sem instalador ECC ou adaptador direto hoje | Usar como alvo de comparação para requisitos de estado de worktree/sessão | `npm run observability:ready` | Não importar suposições específicas do produto; converter lições em campos de evento do ECC. |
| Superset | Somente referência | Presets de workspace; loops de revisão de agentes paralelos; pressão de design de isolamento de worktree | Sem instalador ECC ou adaptador direto hoje | Usar como alvo de comparação para taxonomia de presets de workspace | `npm run observability:ready` | Manter o ECC portátil; não exigir um workspace de desktop para obter valor básico. |
| Ghast | Somente referência | Agrupamento de painéis nativo do terminal; agrupamento por cwd; busca; notificações | Sem instalador ECC ou adaptador direto hoje | Usar como alvo de comparação para agrupamento de sessão orientado ao terminal | `node scripts/session-inspect.js --list-adapters` | Preservar a ergonomia do terminal antes de adicionar suposições de UI visual. |
| Somente terminal | Nativo | skills; regras; comandos; scripts; auditoria de harness; prontidão de observabilidade; handoffs | Sem UI externa, sem controle automático de sessão a menos que os scripts sejam executados explicitamente | Clonar repositório; executar comandos diretamente; usar perfil minimal para instalações de projeto | `npm run harness:audit -- --format json`; `npm run observability:ready` | Este é o contrato de fallback; todo adaptador de nível superior deve degradar para ele. |
<!-- harness-adapter-compliance:matrix-end -->

## Onramp do Scorecard

Use esta sequência antes de pedir ao ECC para tornar a configuração de uma equipe ou
repositório mais autônoma:

```bash
npm run harness:adapters -- --check
npm run harness:audit -- --format json
npm run observability:ready
node scripts/session-inspect.js --list-adapters
node scripts/loop-status.js --json --write-dir .ecc/loop-status
```

Leia o resultado como um scorecard de configuração, não como um badge de produto:

- `harness:adapters -- --check` prova que esta matriz pública ainda corresponde aos dados de
  origem do adaptador e aos campos de evidência obrigatórios.
- `harness:audit` pontua cobertura de ferramentas, eficiência de contexto, gates de qualidade,
  persistência de memória, cobertura de evals, guardrails de segurança e eficiência de custo.
- `observability:ready` prova que o repositório ainda expõe os sinais de status local,
  sessão, atividade de ferramentas, registro de risco e onramp de release.
- `session-inspect --list-adapters` mostra quais superfícies de sessão são realmente
  inspecionáveis no ambiente atual.
- `loop-status --json` cria um payload de handoff/status legível por máquina para
  execuções autônomas mais longas.

## Contrato de Scorecard Baseado em Dados

Cada registro de adaptador expõe:

- `id`
- `state`
- `supported_assets`
- `unsupported_surfaces`
- `install_or_onramp`
- `verification_commands`
- `risk_notes`
- `last_verified_at`
- `owner`
- `source_docs`

O validador falha se uma afirmação pública do adaptador não tiver caminho de instalação,
comando de verificação, nota de risco, proprietário, documento de origem ou data de
verificação.

## Regras Operacionais

- Preferir adaptadores pequenos e aditivos em vez de forks específicos do harness do mesmo
  fluxo de trabalho.
- Não chamar um harness de nativo até que o adaptador tenha um caminho de instalação e um
  comando de verificação.
- Manter as superfícies do Codex, Gemini e Zed honestas quando a aplicação é baseada em
  instrução em vez de em tempo de execução.
- Tratar ferramentas somente de referência como pressão de design até que o ECC tenha um
  adaptador direto.
- Manter o caminho somente de terminal saudável; é o piso de portabilidade.
