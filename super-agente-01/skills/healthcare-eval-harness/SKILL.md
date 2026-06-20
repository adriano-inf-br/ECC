---
name: healthcare-eval-harness
description: Harness de avaliação de segurança do paciente para implantações de aplicações de saúde. Suítes de testes automatizados para precisão de CDSS, exposição de PHI, integridade de fluxo de trabalho clínico e conformidade de integração. Bloqueia implantações em caso de falhas de segurança.
metadata:
  origin: Health1 Super Speciality Hospitals — contributed by Dr. Keyur Patel
version: "1.0.0"
---

# Healthcare Eval Harness — Verificação de Segurança do Paciente

Sistema de verificação automatizada para implantações de aplicações de saúde. Uma única falha CRÍTICA bloqueia a implantação. A segurança do paciente não é negociável.

> **Nota:** Os exemplos usam Jest como framework de referência para testes. Adapte os comandos para o seu framework (Vitest, pytest, PHPUnit, etc.) — as categorias de teste e os limites de aprovação são agnósticos ao framework.

## Quando Usar

- Antes de qualquer implantação de aplicações EMR/EHR
- Após modificar a lógica de CDSS (interações medicamentosas, validação de doses, pontuação)
- Após alterar esquemas de banco de dados que tocam dados de pacientes
- Após modificar autenticação ou controle de acesso
- Durante a configuração do pipeline CI/CD para aplicações de saúde
- Após resolver conflitos de merge em módulos clínicos

## Como Funciona

O eval harness executa cinco categorias de teste em ordem. As três primeiras (Precisão do CDSS, Exposição de PHI, Integridade de Dados) são portões CRÍTICOS exigindo 100% de aprovação — uma única falha bloqueia a implantação. As duas restantes (Fluxo de Trabalho Clínico, Integração) são portões ALTOS exigindo 95%+ de aprovação.

Cada categoria mapeia para um padrão de caminho de teste do Jest. O pipeline de CI executa os portões CRÍTICOS com `--bail` (para na primeira falha) e aplica limites de cobertura com `--coverage --coverageThreshold`.

### Categorias de Avaliação

**1. Precisão do CDSS (CRÍTICO — 100% exigido)**

Testa toda a lógica de suporte à decisão clínica: pares de interações medicamentosas (ambas as direções), regras de validação de doses, pontuação clínica vs. especificações publicadas, sem falsos negativos, sem falhas silenciosas.

```bash
npx jest --testPathPattern='tests/cdss' --bail --ci --coverage
```

**2. Exposição de PHI (CRÍTICO — 100% exigido)**

Testa vazamentos de informações de saúde protegidas: respostas de erro da API, saída do console, parâmetros de URL, armazenamento do navegador, isolamento entre instalações, acesso não autenticado, ausência da chave service role.

```bash
npx jest --testPathPattern='tests/security/phi' --bail --ci
```

**3. Integridade de Dados (CRÍTICO — 100% exigido)**

Testa a segurança dos dados clínicos: consultas bloqueadas, entradas de trilha de auditoria, proteção contra exclusão em cascata, tratamento de edições concorrentes, sem registros órfãos.

```bash
npx jest --testPathPattern='tests/data-integrity' --bail --ci
```

**4. Fluxo de Trabalho Clínico (ALTO — 95%+ exigido)**

Testa fluxos de ponta a ponta: ciclo de vida de consultas, renderização de templates, conjuntos de medicamentos, busca de medicamentos/diagnósticos, PDF de prescrição, alertas de sinais de alerta.

```bash
tmp_json=$(mktemp)
npx jest --testPathPattern='tests/clinical' --ci --json --outputFile="$tmp_json" || true
total=$(jq '.numTotalTests // 0' "$tmp_json")
passed=$(jq '.numPassedTests // 0' "$tmp_json")
if [ "$total" -eq 0 ]; then
  echo "No clinical tests found" >&2
  exit 1
fi
rate=$(echo "scale=2; $passed * 100 / $total" | bc)
echo "Clinical pass rate: ${rate}% ($passed/$total)"
```

**5. Conformidade de Integração (ALTO — 95%+ exigido)**

Testa sistemas externos: análise de mensagens HL7 (v2.x), validação FHIR, mapeamento de resultados laboratoriais, tratamento de mensagens malformadas.

```bash
tmp_json=$(mktemp)
npx jest --testPathPattern='tests/integration' --ci --json --outputFile="$tmp_json" || true
total=$(jq '.numTotalTests // 0' "$tmp_json")
passed=$(jq '.numPassedTests // 0' "$tmp_json")
if [ "$total" -eq 0 ]; then
  echo "No integration tests found" >&2
  exit 1
fi
rate=$(echo "scale=2; $passed * 100 / $total" | bc)
echo "Integration pass rate: ${rate}% ($passed/$total)"
```

### Matriz de Aprovação/Reprovação

| Categoria | Limite | Em Caso de Falha |
|-----------|--------|------------------|
| Precisão do CDSS | 100% | **BLOQUEAR implantação** |
| Exposição de PHI | 100% | **BLOQUEAR implantação** |
| Integridade de Dados | 100% | **BLOQUEAR implantação** |
| Fluxo de Trabalho Clínico | 95%+ | AVISAR, permitir com revisão |
| Integração | 95%+ | AVISAR, permitir com revisão |

### Integração com CI/CD

```yaml
name: Healthcare Safety Gate
on: [push, pull_request]

jobs:
  safety-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci

      # Portões CRÍTICOS — 100% exigido, para na primeira falha
      - name: CDSS Accuracy
        run: npx jest --testPathPattern='tests/cdss' --bail --ci --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'

      - name: PHI Exposure Check
        run: npx jest --testPathPattern='tests/security/phi' --bail --ci

      - name: Data Integrity
        run: npx jest --testPathPattern='tests/data-integrity' --bail --ci

      # Portões ALTOS — 95%+ exigido, verificação de limite personalizado
      # Portões ALTOS — 95%+ exigido
      - name: Clinical Workflows
        run: |
          TMP_JSON=$(mktemp)
          npx jest --testPathPattern='tests/clinical' --ci --json --outputFile="$TMP_JSON" || true
          TOTAL=$(jq '.numTotalTests // 0' "$TMP_JSON")
          PASSED=$(jq '.numPassedTests // 0' "$TMP_JSON")
          if [ "$TOTAL" -eq 0 ]; then
            echo "::error::No clinical tests found"; exit 1
          fi
          RATE=$(echo "scale=2; $PASSED * 100 / $TOTAL" | bc)
          echo "Pass rate: ${RATE}% ($PASSED/$TOTAL)"
          if (( $(echo "$RATE < 95" | bc -l) )); then
            echo "::warning::Clinical pass rate ${RATE}% below 95%"
          fi

      - name: Integration Compliance
        run: |
          TMP_JSON=$(mktemp)
          npx jest --testPathPattern='tests/integration' --ci --json --outputFile="$TMP_JSON" || true
          TOTAL=$(jq '.numTotalTests // 0' "$TMP_JSON")
          PASSED=$(jq '.numPassedTests // 0' "$TMP_JSON")
          if [ "$TOTAL" -eq 0 ]; then
            echo "::error::No integration tests found"; exit 1
          fi
          RATE=$(echo "scale=2; $PASSED * 100 / $TOTAL" | bc)
          echo "Pass rate: ${RATE}% ($PASSED/$TOTAL)"
          if (( $(echo "$RATE < 95" | bc -l) )); then
            echo "::warning::Integration pass rate ${RATE}% below 95%"
          fi
```

### Anti-Padrões

- Pular testes de CDSS "porque passaram na última vez"
- Definir limites CRÍTICOS abaixo de 100%
- Usar `--no-bail` em suítes de testes CRÍTICOS
- Mockar o engine de CDSS em testes de integração (deve testar a lógica real)
- Permitir implantações quando o portão de segurança está vermelho
- Executar testes sem `--coverage` em suítes de CDSS

## Exemplos

### Exemplo 1: Executar Todos os Portões Críticos Localmente

```bash
npx jest --testPathPattern='tests/cdss' --bail --ci --coverage && \
npx jest --testPathPattern='tests/security/phi' --bail --ci && \
npx jest --testPathPattern='tests/data-integrity' --bail --ci
```

### Exemplo 2: Verificar Taxa de Aprovação do Portão ALTO

```bash
tmp_json=$(mktemp)
npx jest --testPathPattern='tests/clinical' --ci --json --outputFile="$tmp_json" || true
jq '{
  passed: (.numPassedTests // 0),
  total: (.numTotalTests // 0),
  rate: (if (.numTotalTests // 0) == 0 then 0 else ((.numPassedTests // 0) / (.numTotalTests // 1) * 100) end)
}' "$tmp_json"
# Esperado: { "passed": 21, "total": 22, "rate": 95.45 }
```

### Exemplo 3: Relatório de Avaliação

```
## Healthcare Eval: 2026-03-27 [commit abc1234]

### Segurança do Paciente: APROVADO

| Categoria | Testes | Aprovados | Reprovados | Status |
|-----------|--------|-----------|------------|--------|
| Precisão CDSS | 39 | 39 | 0 | APROVADO |
| Exposição PHI | 8 | 8 | 0 | APROVADO |
| Integridade de Dados | 12 | 12 | 0 | APROVADO |
| Fluxo de Trabalho Clínico | 22 | 21 | 1 | 95,5% APROVADO |
| Integração | 6 | 6 | 0 | APROVADO |

### Cobertura: 84% (meta: 80%+)
### Veredicto: SEGURO PARA IMPLANTAR
```
