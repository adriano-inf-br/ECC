---
name: eval-harness
description: Framework formal de avaliação para sessões do Claude Code que implementa os princípios de desenvolvimento orientado a avaliações (EDD)
metadata:
  origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Eval Harness Skill

Um framework formal de avaliação para sessões do Claude Code, que implementa os princípios de desenvolvimento orientado a avaliações (EDD).

## When to Activate

- Configurar desenvolvimento orientado a avaliações (EDD) para fluxos de trabalho assistidos por IA
- Definir critérios de aprovação/reprovação para a conclusão de tarefas no Claude Code
- Medir a confiabilidade do agent com métricas pass@k
- Criar suítes de testes de regressão para alterações de prompt ou de agent
- Avaliar o desempenho do agent em diferentes versões de modelo (benchmarking)

## Filosofia

O Desenvolvimento Orientado a Avaliações trata as avaliações como os "testes unitários do desenvolvimento de IA":
- Defina o comportamento esperado ANTES da implementação
- Execute as avaliações continuamente durante o desenvolvimento
- Acompanhe regressões a cada alteração
- Use métricas pass@k para medir a confiabilidade

## Tipos de Avaliação

### Avaliações de Capacidade
Testam se o Claude consegue fazer algo que antes não conseguia:
```markdown
[CAPABILITY EVAL: feature-name]
Task: Description of what Claude should accomplish
Success Criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Criterion 3
Expected Output: Description of expected result
```

### Avaliações de Regressão
Garantem que as alterações não quebrem funcionalidades existentes:
```markdown
[REGRESSION EVAL: feature-name]
Baseline: SHA or checkpoint name
Tests:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL
  - existing-test-3: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## Tipos de Avaliador (Grader)

### 1. Avaliador Baseado em Código
Verificações determinísticas usando código:
```bash
# Check if file contains expected pattern
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# Check if tests pass
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# Check if build succeeds
npm run build && echo "PASS" || echo "FAIL"
```

### 2. Avaliador Baseado em Modelo
Use o Claude para avaliar saídas abertas:
```markdown
[MODEL GRADER PROMPT]
Evaluate the following code change:
1. Does it solve the stated problem?
2. Is it well-structured?
3. Are edge cases handled?
4. Is error handling appropriate?

Score: 1-5 (1=poor, 5=excellent)
Reasoning: [explanation]
```

### 3. Avaliador Humano
Sinalize para revisão manual:
```markdown
[HUMAN REVIEW REQUIRED]
Change: Description of what changed
Reason: Why human review is needed
Risk Level: LOW/MEDIUM/HIGH
```

## Métricas

### pass@k
"Ao menos um sucesso em k tentativas"
- pass@1: taxa de sucesso na primeira tentativa
- pass@3: sucesso em até 3 tentativas
- Meta típica: pass@3 > 90%

### pass^k
"Todas as k tentativas têm sucesso"
- Critério mais rigoroso de confiabilidade
- pass^3: 3 sucessos consecutivos
- Use para caminhos críticos

## Fluxo de Trabalho de Avaliação

### 1. Definir (Antes de Codificar)
```markdown
## EVAL DEFINITION: feature-xyz

### Capability Evals
1. Can create new user account
2. Can validate email format
3. Can hash password securely

### Regression Evals
1. Existing login still works
2. Session management unchanged
3. Logout flow intact

### Success Metrics
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

### 2. Implementar
Escreva o código para passar nas avaliações definidas.

### 3. Avaliar
```bash
# Run capability evals
[Run each capability eval, record PASS/FAIL]

# Run regression evals
npm test -- --testPathPattern="existing"

# Generate report
```

### 4. Reportar
```markdown
EVAL REPORT: feature-xyz
========================

Capability Evals:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  Overall:         3/3 passed

Regression Evals:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  Overall:         3/3 passed

Metrics:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

Status: READY FOR REVIEW
```

## Padrões de Integração

### Pré-Implementação
```
/eval define feature-name
```
Cria um arquivo de definição de avaliação em `.claude/evals/feature-name.md`

### Durante a Implementação
```
/eval check feature-name
```
Executa as avaliações atuais e reporta o status

### Pós-Implementação
```
/eval report feature-name
```
Gera o relatório completo de avaliação

## Armazenamento de Avaliações

Armazene as avaliações no projeto:
```
.claude/
  evals/
    feature-xyz.md      # Eval definition
    feature-xyz.log     # Eval run history
    baseline.json       # Regression baselines
```

## Boas Práticas

1. **Defina as avaliações ANTES de codificar** - Força um raciocínio claro sobre os critérios de sucesso
2. **Execute as avaliações com frequência** - Detecte regressões cedo
3. **Acompanhe pass@k ao longo do tempo** - Monitore tendências de confiabilidade
4. **Use avaliadores de código quando possível** - Determinístico > probabilístico
5. **Revisão humana para segurança** - Nunca automatize totalmente verificações de segurança
6. **Mantenha as avaliações rápidas** - Avaliações lentas não são executadas
7. **Versione as avaliações junto com o código** - Avaliações são artefatos de primeira classe

## Exemplo: Adicionando Autenticação

```markdown
## EVAL: add-authentication

### Phase 1: Define (10 min)
Capability Evals:
- [ ] User can register with email/password
- [ ] User can login with valid credentials
- [ ] Invalid credentials rejected with proper error
- [ ] Sessions persist across page reloads
- [ ] Logout clears session

Regression Evals:
- [ ] Public routes still accessible
- [ ] API responses unchanged
- [ ] Database schema compatible

### Phase 2: Implement (varies)
[Write code]

### Phase 3: Evaluate
Run: /eval check add-authentication

### Phase 4: Report
EVAL REPORT: add-authentication
==============================
Capability: 5/5 passed (pass@3: 100%)
Regression: 3/3 passed (pass^3: 100%)
Status: SHIP IT
```

## Avaliações de Produto (v1.8)

Use avaliações de produto quando a qualidade do comportamento não puder ser capturada apenas por testes unitários.

### Tipos de Avaliador (Grader)

1. Avaliador de código (asserções determinísticas)
2. Avaliador de regras (restrições de regex/esquema)
3. Avaliador de modelo (rubrica de LLM como juiz)
4. Avaliador humano (julgamento manual para saídas ambíguas)

### Orientações sobre pass@k

- `pass@1`: confiabilidade direta
- `pass@3`: confiabilidade prática sob retentativas controladas
- `pass^3`: teste de estabilidade (todas as 3 execuções devem passar)

Limiares recomendados:
- Avaliações de capacidade: pass@3 >= 0.90
- Avaliações de regressão: pass^3 = 1.00 para caminhos críticos de lançamento

### Antipadrões de Avaliação

- Overfitting de prompts a exemplos de avaliação conhecidos
- Medir apenas saídas do caminho feliz
- Ignorar a deriva de custo e latência ao perseguir taxas de aprovação
- Permitir avaliadores instáveis nos portões de lançamento

### Layout Mínimo de Artefatos de Avaliação

- `.claude/evals/<feature>.md` definição
- `.claude/evals/<feature>.log` histórico de execução
- `docs/releases/<version>/eval-summary.md` snapshot de lançamento
