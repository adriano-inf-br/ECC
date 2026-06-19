---
name: api-connector-builder
description: Construa um novo conector ou provedor de API correspondendo exatamente ao padrão de integração existente no repositório-alvo. Use ao adicionar mais uma integração sem inventar uma segunda arquitetura.
metadata:
  origin: ECC direct-port adaptation
version: "1.0.0"
---

# API Connector Builder

Use isto quando a tarefa for adicionar uma superfície de integração nativa do repositório, e não apenas um cliente HTTP genérico.

O objetivo é corresponder ao padrão do repositório hospedeiro:

- layout do conector
- esquema de configuração
- modelo de autenticação
- tratamento de erros
- estilo de teste
- ligação de registro/descoberta (registration/discovery)

## When to Use

- "Construa um conector do Jira para este projeto"
- "Adicione um provedor do Slack seguindo o padrão existente"
- "Crie uma nova integração para esta API"
- "Construa um Plugin que corresponda ao estilo de conector do repositório"

## Guardrails

- não invente uma nova arquitetura de integração quando o repositório já tem uma
- não comece apenas pela documentação do fornecedor; comece primeiro pelos conectores já existentes no repositório
- não pare no código de transporte se o repositório espera ligação de registro, testes e documentação
- não faça cargo-cult de conectores antigos se o repositório tem um padrão atual mais recente

## Workflow

### 1. Aprenda o estilo da casa

Inspecione pelo menos 2 conectores/provedores existentes e mapeie:

- layout de arquivos
- limites de abstração
- modelo de configuração
- convenções de retry / paginação
- hooks de registro
- fixtures de teste e nomenclatura

### 2. Restrinja a integração-alvo

Defina apenas a superfície que o repositório realmente precisa:

- fluxo de autenticação
- entidades-chave
- operações principais de leitura/escrita
- paginação e limites de taxa (rate limits)
- modelo de webhook ou polling

### 3. Construa em camadas nativas do repositório

Fatias típicas:

- config/schema
- cliente/transporte
- camada de mapeamento
- ponto de entrada do conector/provedor
- registro
- testes

### 4. Valide contra o padrão de origem

O novo conector deve parecer óbvio no codebase, e não importado de um ecossistema diferente.

## Reference Shapes

### Estilo Provedor (Provider-style)

```text
providers/
  existing_provider/
    __init__.py
    provider.py
    config.py
```

### Estilo Conector (Connector-style)

```text
integrations/
  existing/
    client.py
    models.py
    connector.py
```

### Estilo Plugin TypeScript (TypeScript plugin-style)

```text
src/integrations/
  existing/
    index.ts
    client.ts
    types.ts
    test.ts
```

## Quality Checklist

- [ ] corresponde a um padrão de integração já existente no repositório
- [ ] existe validação de configuração
- [ ] autenticação e tratamento de erros são explícitos
- [ ] o comportamento de paginação/retry segue as normas do repositório
- [ ] a ligação de registro/descoberta está completa
- [ ] os testes espelham o estilo do repositório hospedeiro
- [ ] docs/exemplos são atualizados se o repositório esperar isso

## Related Skills

- `backend-patterns`
- `mcp-server-patterns`
- `github-ops`
