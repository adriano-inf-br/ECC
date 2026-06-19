# Padrões de Revisão de Código

## Propósito

A revisão de código garante qualidade, segurança e manutenibilidade antes que o código seja mesclado. Esta regra define quando e como conduzir revisões de código.

## Quando Revisar

**Gatilhos OBRIGATÓRIOS de revisão:**

- Após escrever ou modificar código
- Antes de qualquer commit em branches compartilhadas
- Quando código sensível à segurança é alterado (auth, pagamentos, dados do usuário)
- Quando mudanças arquiteturais são feitas
- Antes de mesclar pull requests

**Requisitos pré-revisão:**

Antes de solicitar revisão, garanta:

- Todas as verificações automatizadas (CI/CD) estão passando
- Conflitos de merge resolvidos
- Branch está atualizada com a branch de destino

## Checklist de Revisão

Antes de marcar o código como concluído:

- [ ] Código é legível e bem nomeado
- [ ] Funções são focadas (<50 linhas)
- [ ] Arquivos são coesos (<800 linhas)
- [ ] Sem aninhamento profundo (>4 níveis)
- [ ] Erros são tratados explicitamente
- [ ] Sem segredos ou credenciais hardcoded
- [ ] Sem console.log ou instruções de debug
- [ ] Testes existem para a nova funcionalidade
- [ ] Cobertura de testes atende ao mínimo de 80%

## Gatilhos de Revisão de Segurança

**PARE e use o agent security-reviewer quando houver:**

- Código de autenticação ou autorização
- Tratamento de entrada do usuário
- Queries de banco de dados
- Operações de sistema de arquivos
- Chamadas de API externa
- Operações criptográficas
- Código de pagamento ou financeiro

## Níveis de Severidade da Revisão

| Nível | Significado | Ação |
|-------|---------|--------|
| CRITICAL | Vulnerabilidade de segurança ou risco de perda de dados | **BLOQUEAR** - Deve corrigir antes de mesclar |
| HIGH | Bug ou problema significativo de qualidade | **AVISAR** - Deve corrigir antes de mesclar |
| MEDIUM | Preocupação de manutenibilidade | **INFO** - Considere corrigir |
| LOW | Estilo ou sugestão menor | **NOTA** - Opcional |

## Uso de Agents

Use estes agents para revisão de código:

| Agent | Propósito |
|-------|---------|
| **code-reviewer** | Qualidade geral de código, padrões, melhores práticas |
| **security-reviewer** | Vulnerabilidades de segurança, OWASP Top 10 |
| **typescript-reviewer** | Problemas específicos de TypeScript/JavaScript |
| **python-reviewer** | Problemas específicos de Python |
| **go-reviewer** | Problemas específicos de Go |
| **rust-reviewer** | Problemas específicos de Rust |

## Fluxo de Trabalho de Revisão

```
1. Execute git diff para entender as mudanças
2. Verifique primeiro o checklist de segurança
3. Revise o checklist de qualidade de código
4. Execute os testes relevantes
5. Verifique cobertura >= 80%
6. Use o agent apropriado para revisão detalhada
```

## Problemas Comuns a Detectar

### Segurança

- Credenciais hardcoded (chaves de API, senhas, tokens)
- Injeção SQL (concatenação de strings em queries)
- Vulnerabilidades de XSS (entrada do usuário não escapada)
- Path traversal (caminhos de arquivo não sanitizados)
- Proteção CSRF ausente
- Bypasses de autenticação

### Qualidade de Código

- Funções grandes (>50 linhas) - divida em menores
- Arquivos grandes (>800 linhas) - extraia módulos
- Aninhamento profundo (>4 níveis) - use early returns
- Tratamento de erros ausente - trate explicitamente
- Padrões de mutação - prefira operações imutáveis
- Testes ausentes - adicione cobertura de testes

### Desempenho

- Queries N+1 - use JOINs ou batching
- Paginação ausente - adicione LIMIT às queries
- Queries sem limites - adicione restrições
- Cache ausente - faça cache de operações custosas

## Critérios de Aprovação

- **Aprovar**: Sem problemas CRITICAL ou HIGH
- **Aviso**: Apenas problemas HIGH (mesclar com cautela)
- **Bloquear**: Problemas CRITICAL encontrados

## Integração com Outras Regras

Esta regra funciona com:

- [testing.md](testing.md) - Requisitos de cobertura de testes
- [security.md](security.md) - Checklist de segurança
- [git-workflow.md](git-workflow.md) - Padrões de commit
- [agents.md](agents.md) - Delegação a agents
