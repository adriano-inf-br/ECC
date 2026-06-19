---
description: Executa o AgentShield contra superfícies de agent, hook, MCP, permissões e segredos.
agent: everything-claude-code:security-reviewer
subtask: true
---

# Security Scan Command

Execute o AgentShield contra o projeto atual ou um caminho alvo, depois transforme os achados em um plano de remediação priorizado.

## Uso

`/security-scan [path] [--format text|json|markdown|html] [--min-severity low|medium|high|critical] [--fix]`

- `path` (opcional): assume o projeto atual por padrão. Use um caminho `.claude/`, a raiz de um repositório ou um diretório de template versionado.
- `--format`: formato de saída. Use `json` para CI, `markdown` para repasses e `html` para relatórios de revisão autônomos.
- `--min-severity`: filtra achados de menor prioridade.
- `--fix`: aplica apenas correções do AgentShield explicitamente marcadas como seguras e auto-corrigíveis.

## Motor determinístico

Prefira o scanner empacotado:

```bash
npx ecc-agentshield scan --path "${TARGET_PATH:-.}" --format text
```

Para desenvolvimento local do AgentShield, execute a partir do checkout do AgentShield:

```bash
npm run scan -- --path "${TARGET_PATH:-.}" --format text
```

Não invente achados. Use a saída do AgentShield como fonte da verdade e separe os fatos do scanner do julgamento de acompanhamento.

## Checklist de revisão

1. Identifique primeiro os achados ativos em tempo de execução:
   - segredos embutidos no código
   - permissões amplas
   - hooks executáveis
   - servidores MCP com shell, sistema de arquivos, transporte remoto ou `npx` não fixado
   - prompts de agent que lidam com conteúdo não confiável sem defesas
2. Separe o inventário de menor confiança:
   - exemplos em docs
   - exemplos de template
   - manifestos de plugin
   - configurações opcionais locais do projeto
3. Para cada achado crítico ou alto, retorne:
   - caminho do arquivo
   - severidade
   - confiança em tempo de execução
   - por que importa
   - remediação exata
   - se é seguro auto-corrigir
4. Se `--fix` for solicitado, declare as edições planejadas antes de aplicar as correções.
5. Re-execute o scan após as correções e reporte a pontuação antes/depois.

## Contrato de saída

Retorne:

1. Nota e pontuação de segurança.
2. Contagens por severidade e confiança em tempo de execução.
3. Achados críticos/altos com caminhos exatos.
4. Achados de menor confiança agrupados separadamente.
5. Uma ordem de remediação.
6. Comandos executados e se o scan foi local, em CI ou via npx.

## Padrão de CI

Use o AgentShield no GitHub Actions para portões obrigatórios:

```yaml
- uses: affaan-m/agentshield@v1
  with:
    path: "."
    min-severity: "medium"
    fail-on-findings: true
```

## Links

- Skill: `skills/security-scan/SKILL.md`
- Agent: `agents/security-reviewer.md`
- Scanner: <https://github.com/affaan-m/agentshield>

## Argumentos

$ARGUMENTS:
- caminho alvo opcional
- flags opcionais do AgentShield
