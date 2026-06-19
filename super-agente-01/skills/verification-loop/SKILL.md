---
name: verification-loop
description: "Um sistema abrangente de verificação para sessões do Claude Code."
metadata:
  origin: ECC
---

# Skill de Loop de Verificação

Um sistema abrangente de verificação para sessões do Claude Code.

## Quando Usar

Invoque esta skill:
- Após concluir uma feature ou alteração significativa de código
- Antes de criar um PR
- Quando quiser garantir que os quality gates sejam aprovados
- Após refatoração

## Fases de Verificação

### Fase 1: Verificação de Build
```bash
# Verifica se o projeto compila
npm run build 2>&1 | tail -20
# OU
pnpm build 2>&1 | tail -20
```

Se o Build falhar, PARE e corrija antes de continuar.

### Fase 2: Verificação de Tipos
```bash
# Projetos TypeScript
npx tsc --noEmit 2>&1 | head -30

# Projetos Python
pyright . 2>&1 | head -30
```

Reporte todos os erros de tipo. Corrija os críticos antes de continuar.

### Fase 3: Verificação de Lint
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### Fase 4: Suíte de Testes
```bash
# Executa testes com cobertura
npm run test -- --coverage 2>&1 | tail -50

# Verifica o limite de cobertura
# Meta: mínimo de 80%
```

Reporte:
- Total de testes: X
- Aprovados: X
- Reprovados: X
- Cobertura: X%

### Fase 5: Varredura de Segurança
```bash
# Verifica segredos
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# Verifica console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### Fase 6: Revisão do Diff
```bash
# Mostra o que foi alterado
git diff --stat
git diff HEAD~1 --name-only
```

Revise cada arquivo alterado quanto a:
- Alterações não intencionais
- Tratamento de erros ausente
- Potenciais casos extremos

## Saída

Após executar todas as fases, produza um relatório de verificação:

```
RELATÓRIO DE VERIFICAÇÃO
==================

Build:        [APROVADO/REPROVADO]
Tipos:        [APROVADO/REPROVADO] (X erros)
Lint:         [APROVADO/REPROVADO] (X avisos)
Testes:       [APROVADO/REPROVADO] (X/Y aprovados, Z% de cobertura)
Segurança:    [APROVADO/REPROVADO] (X problemas)
Diff:         [X arquivos alterados]

Geral:        [PRONTO/NÃO PRONTO] para PR

Problemas a Corrigir:
1. ...
2. ...
```

## Modo Contínuo

Para sessões longas, execute a verificação a cada 15 minutos ou após grandes alterações:

```markdown
Defina um ponto de controle mental:
- Após concluir cada função
- Após finalizar um componente
- Antes de passar para a próxima tarefa

Execute: /verify
```

## Integração com Hooks

Esta skill complementa os Hooks PostToolUse, mas fornece uma verificação mais aprofundada.
Os Hooks detectam problemas imediatamente; esta skill oferece uma revisão abrangente.
