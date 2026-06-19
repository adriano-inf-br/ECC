---
description: Loop de convergência de revisão dupla adversarial — dois revisores de modelos independentes devem ambos aprovar antes de o código seguir.
---

# Santa Loop

Loop de convergência de revisão dupla adversarial usando a skill santa-method. Dois revisores independentes — modelos diferentes, sem contexto compartilhado — devem ambos retornar NICE antes de o código seguir.

## Propósito

Execute dois revisores independentes (Claude Opus + um modelo externo) contra a saída da tarefa atual. Ambos devem retornar NICE antes de o código ser enviado. Se qualquer um retornar NAUGHTY, corrija todos os problemas sinalizados, faça o commit e re-execute revisores novos — até 3 rodadas.

## Uso

```
/santa-loop [file-or-glob | description]
```

## Fluxo de trabalho

### Passo 1: Identifique o que revisar

Determine o escopo a partir de `$ARGUMENTS` ou recorra às mudanças não commitadas:

```bash
git diff --name-only HEAD
```

Leia todos os arquivos alterados para construir o contexto completo da revisão. Se `$ARGUMENTS` especificar um caminho, arquivo ou descrição, use isso como escopo.

### Passo 2: Construa a rubrica

Construa uma rubrica apropriada aos tipos de arquivo em revisão. Todo critério deve ter uma condição objetiva de PASS/FAIL. Inclua no mínimo:

| Critério | Condição de aprovação |
|-----------|---------------|
| Correção | Lógica sólida, sem bugs, trata casos extremos |
| Segurança | Sem segredos, injeção, XSS ou problemas do OWASP Top 10 |
| Tratamento de erros | Erros tratados explicitamente, sem engolir silenciosamente |
| Completude | Todos os requisitos atendidos, sem casos faltando |
| Consistência interna | Sem contradições entre arquivos ou seções |
| Sem regressões | Mudanças não quebram o comportamento existente |

Adicione critérios específicos do domínio com base nos tipos de arquivo (ex.: segurança de tipos para TS, segurança de memória para Rust, segurança de migração para SQL).

### Passo 3: Revisão dupla independente

Inicie dois revisores **em paralelo** usando a ferramenta Agent (ambos em uma única mensagem para execução concorrente). Ambos devem concluir antes de prosseguir ao portão de veredito.

Cada revisor avalia cada critério da rubrica como PASS ou FAIL e então retorna JSON estruturado:

```json
{
  "verdict": "PASS" | "FAIL",
  "checks": [
    {"criterion": "...", "result": "PASS|FAIL", "detail": "..."}
  ],
  "critical_issues": ["..."],
  "suggestions": ["..."]
}
```

O portão de veredito (Passo 4) mapeia isso para NICE/NAUGHTY: ambos PASS → NICE, qualquer FAIL → NAUGHTY.

#### Revisor A: Claude Agent (sempre executa)

Inicie um Agent (subagent_type: `code-reviewer`, model: `opus`) com a rubrica completa + todos os arquivos em revisão. O prompt deve incluir:
- A rubrica completa
- Todo o conteúdo dos arquivos em revisão
- "You are an independent quality reviewer. You have NOT seen any other review. Your job is to find problems, not to approve."
- Retornar o veredito JSON estruturado acima

#### Revisor B: Modelo externo (fallback para Claude apenas se nenhum CLI externo estiver instalado)

Primeiro, detecte quais CLIs estão disponíveis:
```bash
command -v codex >/dev/null 2>&1 && echo "codex" || true
command -v gemini >/dev/null 2>&1 && echo "gemini" || true
```

Construa o prompt do revisor (rubrica + instruções idênticas às do Revisor A) e escreva-o em um arquivo temporário único:
```bash
PROMPT_FILE=$(mktemp /tmp/santa-reviewer-b-XXXXXX.txt)
cat > "$PROMPT_FILE" << 'EOF'
... full rubric + file contents + reviewer instructions ...
EOF
```

Use o primeiro CLI disponível:

**Codex CLI** (se instalado)
```bash
codex exec --sandbox read-only -m gpt-5.4 -C "$(pwd)" - < "$PROMPT_FILE"
rm -f "$PROMPT_FILE"
```

**Gemini CLI** (se instalado e codex não)
```bash
gemini -p "$(cat "$PROMPT_FILE")" -m gemini-2.5-pro
rm -f "$PROMPT_FILE"
```

**Fallback para Claude Agent** (apenas se nem `codex` nem `gemini` estiverem instalados)
Inicie um segundo Claude Agent (subagent_type: `code-reviewer`, model: `opus`). Registre um aviso de que ambos os revisores compartilham a mesma família de modelo — a verdadeira diversidade de modelo não foi alcançada, mas o isolamento de contexto ainda é aplicado.

Em todos os casos, o revisor deve retornar o mesmo veredito JSON estruturado do Revisor A.

### Passo 4: Portão de veredito

- **Ambos PASS** → **NICE** — prossiga para o Passo 6 (push)
- **Qualquer FAIL** → **NAUGHTY** — mescle todos os problemas críticos de ambos os revisores, deduplique, prossiga para o Passo 5

### Passo 5: Ciclo de correção (caminho NAUGHTY)

1. Exiba todos os problemas críticos de ambos os revisores
2. Corrija cada problema sinalizado — altere apenas o que foi sinalizado, sem refatorações oportunistas
3. Faça o commit de todas as correções em um único commit:
   ```
   fix: address santa-loop review findings (round N)
   ```
4. Re-execute o Passo 3 com **revisores novos** (sem memória de rodadas anteriores)
5. Repita até ambos retornarem PASS

**Máximo de 3 iterações.** Se ainda NAUGHTY após 3 rodadas, pare e apresente os problemas restantes:

```
SANTA LOOP ESCALATION (exceeded 3 iterations)

Remaining issues after 3 rounds:
- [list all unresolved critical issues from both reviewers]

Manual review required before proceeding.
```

NÃO faça push.

### Passo 6: Push (caminho NICE)

Quando ambos os revisores retornarem PASS:

```bash
git push -u origin HEAD
```

### Passo 7: Relatório final

Imprima o relatório de saída (veja a seção Saída abaixo).

## Saída

```
SANTA VERDICT: [NICE / NAUGHTY (escalated)]

Reviewer A (Claude Opus):   [PASS/FAIL]
Reviewer B ([model used]):  [PASS/FAIL]

Agreement:
  Both flagged:      [issues caught by both]
  Reviewer A only:   [issues only A caught]
  Reviewer B only:   [issues only B caught]

Iterations: [N]/3
Result:     [PUSHED / ESCALATED TO USER]
```

## Notas

- O Revisor A (Claude Opus) sempre executa — garante pelo menos um revisor forte independentemente do ferramental.
- A diversidade de modelo é o objetivo do Revisor B. GPT-5.4 ou Gemini 2.5 Pro dá independência real — dados de treinamento diferentes, vieses diferentes, pontos cegos diferentes. O fallback apenas com Claude ainda agrega valor via isolamento de contexto, mas perde a diversidade de modelo.
- São usados os modelos mais fortes disponíveis: Opus para o Revisor A, GPT-5.4 ou Gemini 2.5 Pro para o Revisor B.
- Revisores externos executam com `--sandbox read-only` (Codex) para evitar mutação do repositório durante a revisão.
- Revisores novos a cada rodada evitam o viés de ancoragem dos achados anteriores.
- A rubrica é a entrada mais importante. Aperte-a se os revisores carimbarem aprovações sem critério ou sinalizarem questões subjetivas de estilo.
- Os commits acontecem nas rodadas NAUGHTY para que as correções sejam preservadas mesmo que o loop seja interrompido.
- O push só acontece após NICE — nunca no meio do loop.
