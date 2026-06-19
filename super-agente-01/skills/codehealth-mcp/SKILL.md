---
name: codehealth-mcp
description: Code Health estrutural em tempo real via CodeScene MCP — revise antes das edições, verifique os deltas de pontuação após as mudanças, faça o gating de commits e PRs. Use ao revisar qualidade de código, refatorar, verificar se mudanças de IA degradaram um arquivo, ou antes de commit/PR.
metadata:
  origin: community
---

# Code Health MCP (CodeScene)

Feedback estrutural de manutenibilidade para código assistido por IA. Complementa as skills de estilo/lint (`coding-standards`, `plankton-code-quality`) com pontuações de saúde em **nível de design** e gates de regressão.

**Upstream:** [codescene-oss/codescene-mcp-server](https://github.com/codescene-oss/codescene-mcp-server)
**Pacote:** `@codescene/codehealth-mcp` (stdio via npx)

## Segurança e limites

**Opt-in (ECC):** O bloco `codescene` em `mcp-configs/mcp-servers.json` é apenas um template. Instalações do plugin ECC não habilitam automaticamente servidores MCP empacotados. Copie a entrada para a sua configuração apenas se quiser. Você pode excluí-la durante o install/sync do ECC com `ECC_DISABLED_MCPS=codescene,...`.

**Credenciais:** Sem token empacotado. Defina o `CS_ACCESS_TOKEN` você mesmo (veja [getting-a-personal-access-token.md](https://github.com/codescene-oss/codescene-mcp-server/blob/main/docs/getting-a-personal-access-token.md) no repositório upstream). Nunca faça commit de tokens no repositório.

**O que as tools leem:** Quando invocadas, as tools analisam arquivos e o estado do git **no repositório local** para o qual você as aponta (os caminhos que você passa, mais o contexto de branch para `analyze_change_set`). Elas não rodam sozinhas. Para o modo standalone, siga a documentação de privacidade upstream: [README do codescene-mcp-server](https://github.com/codescene-oss/codescene-mcp-server#frequently-asked-questions) e [políticas da CodeScene](https://codescene.com/policies). Não use esta skill para segredos, credenciais ou caminhos que você não queira que sejam analisados.

**Se o MCP estiver indisponível (offline, token inválido, crash do servidor):** Não invente pontuações de Code Health. Avise o usuário que a verificação foi pulada. Continue apenas com aprovação explícita do usuário. Prefira lint/tests/verification-loop para o gating quando o MCP estiver fora do ar. Reabilite as verificações assim que o servidor conectar.

## When to Use

- O usuário pede para **revisar a qualidade do código**, **refatorar** um arquivo, ou verificar se **mudanças de IA degradaram** a manutenibilidade
- Antes de editar um **hotspot**, módulo legado ou arquivo desconhecido
- Antes de **commit** ou **pull request** quando você precisa de uma salvaguarda de manutenibilidade
- Após um diff grande escrito por agent — verifique se o Code Health não regrediu
- Combine com `verification-loop`, `tdd-workflow` ou `/quality-gate` como uma verificação estrutural (não um substituto para tests/lint)

## When to Activate

Os mesmos gatilhos de **When to Use** acima — este cabeçalho é o que o ECC usa para a auto-ativação da skill.

## How It Works

### 1. Conectar o servidor MCP

Copie a entrada `codescene` de `mcp-configs/mcp-servers.json` para a configuração MCP do seu harness.

**Claude Code** (`~/.claude.json` → `mcpServers`):

```json
"codescene": {
  "command": "npx",
  "args": ["-y", "@codescene/codehealth-mcp"],
  "env": {
    "CS_ACCESS_TOKEN": "YOUR_CS_ACCESS_TOKEN_HERE"
  }
}
```

**Escopo de projeto:** faça o merge do mesmo bloco em `.mcp.json` na raiz do repositório.

A configuração do token está documentada no repositório upstream (link acima). O modo standalone não requer uma conta paga da plataforma CodeScene para as quatro tools listadas abaixo. Reinicie a sessão e confirme que o servidor `codescene` está conectado antes de confiar nas pontuações.

### 2. Chame apenas as tools standalone

| Tool | Quando usar |
|------|-------------|
| `code_health_review` | Análise estrutural completa **antes** de modificar um arquivo |
| `code_health_score` | Pontuação numérica rápida após cada mudança (verificação de delta) |
| `pre_commit_code_health_safeguard` | Bloqueia commits que introduzem regressões de Code Health |
| `analyze_change_set` | Verificação em nível de branch **antes** de abrir um PR |

**Não** chame tools exclusivas da plataforma (ex.: listas de hotspots de dívida técnica de todo o repositório). **Não** referencie `delta_analysis` — não disponível no standalone.

### 3. Interprete as pontuações (1–10)

| Faixa | Significado | Comportamento do agent |
|-------|---------|----------------|
| **9.0–10.0** | Verde — saudável | Mais seguro estender; ainda prefira fatias verticais |
| **4.0–8.9** | Amarelo — dívida | Pise com cuidado; nada de refatorações de oportunidade |
| **1.0–3.9** | Vermelho — dívida severa | Apenas escopo restrito |

### 4. Execute o loop de feedback

**Antes de tocar em um arquivo**

1. Execute `code_health_review` no caminho-alvo.
2. Registre a pontuação de baseline e os code smells listados.
3. Planeje a menor mudança que atenda à tarefa.

Defina o escopo pela pontuação: **abaixo de 5** — apenas diff mínimo; **5–7** — nenhuma refatoração ampla; **acima de 7** — mais seguro refatorar, ainda verifique após cada edição.

**Após cada mudança**

1. Execute `code_health_score` no mesmo arquivo.
2. Compare com a baseline de `code_health_review`.
3. Se a pontuação **regrediu**, corrija antes de continuar. Nunca marque a tarefa como concluída enquanto a pontuação estiver mais baixa do que quando você começou.

**Antes de cada commit** — execute `pre_commit_code_health_safeguard` no caminho do repositório.

**Antes de um PR** — execute `analyze_change_set` contra a branch base (ex.: `main`).

## Examples

### Example: melhoria de manutenibilidade no Flask

Em `pallets/flask`, um loop de agent usando apenas tools standalone:

1. `code_health_review` em um módulo-alvo (baseline **4.82**)
2. Refatoração direcionada tratando os smells listados
3. `code_health_score` após cada edição
4. `pre_commit_code_health_safeguard` antes do commit
5. `analyze_change_set` antes do PR

Resultado: Code Health **4.82 → 9.1** (apenas com o token standalone gratuito).

### Example: bloco de enforcement do AGENTS.md

Cole no `AGENTS.md` ou no `CLAUDE.md` do projeto:

```md
## Code Health (CodeScene MCP)

Antes de modificar qualquer arquivo: execute `code_health_review`, anote a pontuação e os problemas.

- Pontuação abaixo de 5: faixa problemática — restrinja o escopo das mudanças.
- Pontuação 5–7: faixa de alerta — nenhuma refatoração ampla.

Após cada mudança: execute `code_health_score` para verificar o delta.

- Se a pontuação regrediu: corrija antes de continuar; nunca declare concluído se a pontuação caiu.

Antes de cada commit: execute `pre_commit_code_health_safeguard`.

Antes do PR: execute `analyze_change_set`.
```

### Example: anti-patterns vs. loop correto

```markdown
# RUIM: Editar primeiro, verificar depois
[refatoração grande sem code_health_review]

# RUIM: Ignorar a queda de pontuação
"Os testes passam" → marcar tarefa como concluída enquanto o Code Health diminuiu

# RUIM: Refatoração ampla em arquivo com pontuação vermelha (abaixo de 5)
Limpeza de oportunidade pelo módulo inteiro

# BOM: review → mudança pequena → score → safeguard de commit → analyze_change_set
```

## Combinando com o ECC

| Skill / fluxo do ECC | Papel do Code Health MCP |
|------------------|----------------------|
| `coding-standards` | Estilo/nomenclatura; Code Health = estrutura/complexidade |
| `plankton-code-quality` | Lint/format em tempo de escrita; Code Health = gate estrutural pré/pós edição |
| `verification-loop` / `/quality-gate` | Adiciona verificação de regressão estrutural antes do "done" |
| `security-review` | Segurança vs. manutenibilidade — use ambos quando relevante |
| `tdd-workflow` | Testes passam ≠ design saudável — verifique a pontuação após refatorações |

**Dica de contexto:** O ECC recomenda manter baixa a contagem de MCP. Habilite o `codescene` ao fazer edições substanciais; desabilite quando não for necessário.

## Related Skills

- `coding-standards` — convenções de baseline
- `plankton-code-quality` — hooks de lint/format em tempo de escrita
- `verification-loop` — gate de build/test/lint
- `tdd-workflow` — desenvolvimento test-first
- `security-review` — checklist de segurança
- `documentation-lookup` — docs de bibliotecas via Context7 (ortogonal)
