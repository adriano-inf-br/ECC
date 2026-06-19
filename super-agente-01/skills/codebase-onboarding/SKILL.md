---
name: codebase-onboarding
description: Analise um código desconhecido e gere um guia de onboarding estruturado com mapa de arquitetura, principais pontos de entrada, convenções e um CLAUDE.md inicial. Use ao ingressar em um novo projeto ou ao configurar o Claude Code pela primeira vez em um repositório.
metadata:
  origin: ECC
---

# Codebase Onboarding

Analise sistematicamente um código desconhecido e produza um guia de onboarding estruturado. Projetado para desenvolvedores que ingressam em um novo projeto ou que configuram o Claude Code em um repositório existente pela primeira vez.

## Quando Usar

- Primeira vez abrindo um projeto com o Claude Code
- Ingressar em uma nova equipe ou repositório
- O usuário pede "me ajude a entender este código"
- O usuário pede para gerar um CLAUDE.md para um projeto
- O usuário diz "faça meu onboarding" ou "me guie por este repositório"

## Como Funciona

### Fase 1: Reconhecimento

Reúna sinais brutos sobre o projeto sem ler cada arquivo. Execute estas verificações em paralelo:

```
1. Detecção de manifesto de pacote
   → package.json, go.mod, Cargo.toml, pyproject.toml, pom.xml, build.gradle,
     Gemfile, composer.json, mix.exs, pubspec.yaml

2. Fingerprinting de framework
   → next.config.*, nuxt.config.*, angular.json, vite.config.*,
     django settings, flask app factory, fastapi main, rails config

3. Identificação do ponto de entrada
   → main.*, index.*, app.*, server.*, cmd/, src/main/

4. Snapshot da estrutura de diretórios
   → 2 primeiros níveis da árvore de diretórios, ignorando node_modules, vendor,
     .git, dist, build, __pycache__, .next

5. Detecção de configuração e ferramental
   → .eslintrc*, .prettierrc*, tsconfig.json, Makefile, Dockerfile,
     docker-compose*, .github/workflows/, .env.example, configs de CI

6. Detecção de estrutura de testes
   → tests/, test/, __tests__/, *_test.go, *.spec.ts, *.test.js,
     pytest.ini, jest.config.*, vitest.config.*
```

### Fase 2: Mapeamento de Arquitetura

A partir dos dados de reconhecimento, identifique:

**Tech Stack**
- Linguagem(ns) e restrições de versão
- Framework(s) e principais bibliotecas
- Banco(s) de dados e ORMs
- Ferramentas de build e bundlers
- Plataforma de CI/CD

**Padrão de Arquitetura**
- Monolito, monorepo, microservices ou serverless
- Divisão frontend/backend ou full-stack
- Estilo de API: REST, GraphQL, gRPC, tRPC

**Diretórios Principais**
Mapeie os diretórios de nível superior ao seu propósito:

<!-- Exemplo para um projeto React — substitua pelos diretórios detectados -->
```
src/components/  → componentes de UI React
src/api/         → handlers de rota da API
src/lib/         → utilitários compartilhados
src/db/          → modelos de banco de dados e migrações
tests/           → suítes de teste
scripts/         → scripts de build e deploy
```

**Fluxo de Dados**
Rastreie uma requisição da entrada à resposta:
- Onde uma requisição entra? (router, handler, controller)
- Como ela é validada? (middleware, schemas, guards)
- Onde está a lógica de negócio? (services, models, use cases)
- Como ela chega ao banco de dados? (ORM, queries raw, repositories)

### Fase 3: Detecção de Convenções

Identifique padrões que o código já segue:

**Convenções de Nomenclatura**
- Nomenclatura de arquivos: kebab-case, camelCase, PascalCase, snake_case
- Padrões de nomenclatura de componentes/classes
- Nomenclatura de arquivos de teste: `*.test.ts`, `*.spec.ts`, `*_test.go`

**Padrões de Código**
- Estilo de tratamento de erros: try/catch, tipos Result, códigos de erro
- Injeção de dependência ou imports diretos
- Abordagem de gerenciamento de estado
- Padrões assíncronos: callbacks, promises, async/await, channels

**Convenções do Git**
- Nomenclatura de branches a partir de branches recentes
- Estilo de mensagem de Commit a partir de commits recentes
- Fluxo de trabalho de PR (squash, merge, rebase)
- Se o repositório ainda não tem commits ou apenas um histórico raso (ex.: `git clone --depth 1`), pule esta seção e anote "Histórico do Git indisponível ou raso demais para detectar convenções"

### Fase 4: Gerar Artefatos de Onboarding

Produza duas saídas:

#### Saída 1: Guia de Onboarding

```markdown
# Guia de Onboarding: [Nome do Projeto]

## Visão Geral
[2-3 frases: o que este projeto faz e a quem ele serve]

## Tech Stack
<!-- Exemplo para um projeto Next.js — substitua pelo stack detectado -->
| Camada | Tecnologia | Versão |
|-------|-----------|---------|
| Linguagem | TypeScript | 5.x |
| Framework | Next.js | 14.x |
| Banco de dados | PostgreSQL | 16 |
| ORM | Prisma | 5.x |
| Testes | Jest + Playwright | - |

## Arquitetura
[Diagrama ou descrição de como os componentes se conectam]

## Principais Pontos de Entrada
<!-- Exemplo para um projeto Next.js — substitua pelos caminhos detectados -->
- **Rotas de API**: `src/app/api/` — handlers de rota Next.js
- **Páginas de UI**: `src/app/(dashboard)/` — páginas autenticadas
- **Banco de dados**: `prisma/schema.prisma` — fonte da verdade do modelo de dados
- **Config**: `next.config.ts` — configuração de build e runtime

## Mapa de Diretórios
[Mapeamento diretório de nível superior → propósito]

## Ciclo de Vida da Requisição
[Rastreie uma requisição de API da entrada à resposta]

## Convenções
- [Padrão de nomenclatura de arquivos]
- [Abordagem de tratamento de erros]
- [Padrões de teste]
- [Fluxo de trabalho do Git]

## Tarefas Comuns
<!-- Exemplo para um projeto Node.js — substitua pelos comandos detectados -->
- **Rodar o dev server**: `npm run dev`
- **Rodar os testes**: `npm test`
- **Rodar o linter**: `npm run lint`
- **Migrações de banco de dados**: `npx prisma migrate dev`
- **Build para produção**: `npm run build`

## Onde Procurar
<!-- Exemplo para um projeto Next.js — substitua pelos caminhos detectados -->
| Eu quero... | Veja em... |
|--------------|-----------|
| Adicionar um endpoint de API | `src/app/api/` |
| Adicionar uma página de UI | `src/app/(dashboard)/` |
| Adicionar uma tabela de banco de dados | `prisma/schema.prisma` |
| Adicionar um teste | `tests/` correspondente ao caminho do código-fonte |
| Mudar a configuração de build | `next.config.ts` |
```

#### Saída 2: CLAUDE.md Inicial

Gere ou atualize um CLAUDE.md específico do projeto com base nas convenções detectadas. Se já existir um `CLAUDE.md`, leia-o primeiro e aprimore-o — preserve as instruções específicas do projeto existentes e destaque claramente o que foi adicionado ou alterado.

```markdown
# Project Instructions

## Tech Stack
[Resumo do stack detectado]

## Code Style
- [Convenções de nomenclatura detectadas]
- [Padrões detectados a seguir]

## Testing
- Rodar os testes: `[comando de teste detectado]`
- Padrão de teste: [convenção de arquivo de teste detectada]
- Cobertura: [se configurado, o comando de cobertura]

## Build & Run
- Dev: `[comando de dev detectado]`
- Build: `[comando de build detectado]`
- Lint: `[comando de lint detectado]`

## Project Structure
[Mapa diretório-chave → propósito]

## Conventions
- [Estilo de Commit se detectável]
- [Fluxo de trabalho de PR se detectável]
- [Padrões de tratamento de erros]
```

## Boas Práticas

1. **Não leia tudo** — o reconhecimento deve usar Glob e Grep, não Read em cada arquivo. Leia seletivamente apenas para sinais ambíguos.
2. **Verifique, não adivinhe** — se um framework for detectado pela configuração, mas o código real usar algo diferente, confie no código.
3. **Respeite o CLAUDE.md existente** — se já existir um, aprimore-o em vez de substituí-lo. Destaque o que é novo vs. existente.
4. **Seja conciso** — o guia de onboarding deve ser escaneável em 2 minutos. Os detalhes pertencem ao código, não ao guia.
5. **Sinalize incertezas** — se uma convenção não puder ser detectada com confiança, diga isso em vez de adivinhar. "Não foi possível determinar o test runner" é melhor do que uma resposta errada.

## Anti-Patterns a Evitar

- Gerar um CLAUDE.md com mais de 100 linhas — mantenha-o focado
- Listar cada dependência — destaque apenas as que moldam como você escreve código
- Descrever nomes óbvios de diretório — `src/` não precisa de explicação
- Copiar o README — o guia de onboarding adiciona o insight estrutural que falta no README

## Exemplos

### Exemplo 1: Primeira vez em um repositório novo
**Usuário**: "Onboard me to this codebase"
**Ação**: Execute o fluxo completo de 4 fases → produza o Guia de Onboarding + CLAUDE.md inicial
**Saída**: Guia de Onboarding impresso diretamente na conversa, mais um `CLAUDE.md` gravado na raiz do projeto

### Exemplo 2: Gerar CLAUDE.md para um projeto existente
**Usuário**: "Generate a CLAUDE.md for this project"
**Ação**: Execute as Fases 1-3, pule o Guia de Onboarding, produza apenas o CLAUDE.md
**Saída**: `CLAUDE.md` específico do projeto com as convenções detectadas

### Exemplo 3: Aprimorar um CLAUDE.md existente
**Usuário**: "Update the CLAUDE.md with current project conventions"
**Ação**: Leia o CLAUDE.md existente, execute as Fases 1-3, faça o merge das novas descobertas
**Saída**: `CLAUDE.md` atualizado com as adições claramente marcadas
