---
name: laravel-plugin-discovery
description: Descubra e avalie pacotes Laravel via MCP LaraPlugins.io. Use quando o usuário quiser encontrar plugins, verificar a saúde de um pacote ou avaliar compatibilidade com Laravel/PHP.
metadata:
  origin: ECC
---

# Descoberta de Plugins Laravel

Encontre, avalie e escolha pacotes Laravel saudáveis usando o servidor MCP LaraPlugins.io.

## Quando Usar

- O usuário quer encontrar pacotes Laravel para uma funcionalidade específica (ex.: "auth", "permissions", "admin panel")
- O usuário pergunta "qual pacote devo usar para..." ou "existe um pacote Laravel para..."
- O usuário quer verificar se um pacote está sendo mantido ativamente
- O usuário precisa verificar a compatibilidade com a versão do Laravel
- O usuário quer avaliar a saúde de um pacote antes de adicioná-lo ao projeto

## Requisito MCP

O servidor MCP LaraPlugins deve estar configurado. Adicione ao `mcpServers` do seu `~/.claude.json`:

```json
"laraplugins": {
  "type": "http",
  "url": "https://laraplugins.io/mcp/plugins"
}
```

Nenhuma chave de API é necessária — o servidor é gratuito para a comunidade Laravel.

## Ferramentas MCP

O MCP LaraPlugins fornece duas ferramentas principais:

### SearchPluginTool

Busque pacotes por palavra-chave, pontuação de saúde, vendor e compatibilidade de versão.

**Parâmetros:**
- `text_search` (string, opcional): Palavra-chave para buscar (ex.: "permission", "admin", "api")
- `health_score` (string, opcional): Filtrar por faixa de saúde — `Healthy`, `Medium`, `Unhealthy` ou `Unrated`
- `laravel_compatibility` (string, opcional): Filtrar por versão do Laravel — `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, `"13"`
- `php_compatibility` (string, opcional): Filtrar por versão do PHP — `"7.4"`, `"8.0"`, `"8.1"`, `"8.2"`, `"8.3"`, `"8.4"`, `"8.5"`
- `vendor_filter` (string, opcional): Filtrar por nome de vendor (ex.: "spatie", "laravel")
- `page` (number, opcional): Número da página para paginação

### GetPluginDetailsTool

Busque métricas detalhadas, conteúdo do readme e histórico de versões de um pacote específico.

**Parâmetros:**
- `package` (string, obrigatório): Nome completo do pacote Composer (ex.: "spatie/laravel-permission")
- `include_versions` (boolean, opcional): Inclua o histórico de versões na resposta

---

## Como Funciona

### Encontrando Pacotes

Quando o usuário quer descobrir pacotes para uma funcionalidade:

1. Use `SearchPluginTool` com palavras-chave relevantes
2. Aplique filtros de pontuação de saúde, versão do Laravel ou versão do PHP
3. Revise os resultados com nomes, descrições e indicadores de saúde dos pacotes

### Avaliando Pacotes

Quando o usuário quer avaliar um pacote específico:

1. Use `GetPluginDetailsTool` com o nome do pacote
2. Revise a pontuação de saúde, data da última atualização e suporte a versões do Laravel
3. Verifique a reputação do vendor e indicadores de risco

### Verificando Compatibilidade

Quando o usuário precisa de compatibilidade com versão do Laravel ou PHP:

1. Busque com o filtro `laravel_compatibility` definido para a versão dele
2. Ou obtenha detalhes de um pacote específico para ver suas versões suportadas

---

## Exemplos

### Exemplo: Encontrar Pacotes de Autenticação

```
SearchPluginTool({
  text_search: "authentication",
  health_score: "Healthy"
})
```

Retorna pacotes que correspondem a "authentication" com status saudável:
- spatie/laravel-permission
- laravel/breeze
- laravel/passport
- etc.

### Exemplo: Encontrar Pacotes Compatíveis com Laravel 12

```
SearchPluginTool({
  text_search: "admin panel",
  laravel_compatibility: "12"
})
```

Retorna pacotes compatíveis com Laravel 12.

### Exemplo: Obter Detalhes de um Pacote

```
GetPluginDetailsTool({
  package: "spatie/laravel-permission",
  include_versions: true
})
```

Retorna:
- Pontuação de saúde e última atividade
- Suporte a versões de Laravel/PHP
- Reputação do vendor (pontuação de risco)
- Histórico de versões
- Breve descrição

### Exemplo: Encontrar Pacotes por Vendor

```
SearchPluginTool({
  vendor_filter: "spatie",
  health_score: "Healthy"
})
```

Retorna todos os pacotes saudáveis do vendor "spatie".

---

## Boas Práticas de Filtragem

### Por Pontuação de Saúde

| Faixa de Saúde | Significado |
|-------------|---------|
| `Healthy` | Manutenção ativa, atualizações recentes |
| `Medium` | Atualizações ocasionais, pode precisar de atenção |
| `Unhealthy` | Abandonado ou com manutenção infrequente |
| `Unrated` | Ainda não avaliado |

**Recomendação**: Prefira pacotes `Healthy` para aplicações em produção.

### Por Versão do Laravel

| Versão | Notas |
|---------|-------|
| `13` | Laravel mais recente |
| `12` | Estável atual |
| `11` | Ainda amplamente usado |
| `10` | Legado mas comum |
| `5`-`9` | Descontinuado |

**Recomendação**: Combine com a versão do Laravel do projeto alvo.

### Combinando Filtros

```typescript
// Encontre pacotes saudáveis, compatíveis com Laravel 12 para permissões
SearchPluginTool({
  text_search: "permission",
  health_score: "Healthy",
  laravel_compatibility: "12"
})
```

---

## Interpretação da Resposta

### Resultados da Busca

Cada resultado inclui:
- Nome do pacote (ex.: `spatie/laravel-permission`)
- Breve descrição
- Indicador de status de saúde
- Badges de suporte a versão do Laravel

### Detalhes do Pacote

A resposta detalhada inclui:
- **Pontuação de Saúde**: Indicador numérico ou por faixa
- **Última Atividade**: Quando o pacote foi atualizado pela última vez
- **Suporte Laravel**: Matriz de compatibilidade de versões
- **Suporte PHP**: Compatibilidade com versões do PHP
- **Pontuação de Risco**: Indicadores de confiança do vendor
- **Histórico de Versões**: Cronograma de lançamentos recentes

---

## Casos de Uso Comuns

| Cenário | Abordagem Recomendada |
|----------|---------------------|
| "Qual pacote para auth?" | Busque "auth" com filtro healthy |
| "O spatie/pacote ainda é mantido?" | Obtenha detalhes, verifique a pontuação de saúde |
| "Preciso de pacotes para Laravel 12" | Busque com laravel_compatibility: "12" |
| "Encontre pacotes de admin panel" | Busque "admin panel", revise os resultados |
| "Verifique a reputação do vendor" | Busque por vendor, verifique os detalhes |

---

## Boas Práticas

1. **Sempre filtre por saúde** — Use `health_score: "Healthy"` para projetos em produção
2. **Combine a versão do Laravel** — Sempre verifique se `laravel_compatibility` corresponde ao projeto alvo
3. **Verifique a reputação do vendor** — Prefira pacotes de vendors conhecidos (spatie, laravel, etc.)
4. **Revise antes de recomendar** — Use GetPluginDetailsTool para uma avaliação abrangente
5. **Nenhuma chave de API necessária** — O MCP é gratuito, sem autenticação necessária

---

## Skills Relacionadas

- `laravel-patterns` — Arquitetura e padrões Laravel
- `laravel-tdd` — Desenvolvimento orientado a testes para Laravel
- `laravel-security` — Boas práticas de segurança no Laravel
- `documentation-lookup` — Consulta geral de documentação de bibliotecas (Context7)
