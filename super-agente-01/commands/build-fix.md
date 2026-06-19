---
description: Detecta o sistema de build do projeto e corrige incrementalmente erros de build/tipo com mudanças mínimas e seguras.
---

# Build and Fix

Corrige incrementalmente erros de build e de tipo com mudanças mínimas e seguras.

## Passo 1: Detectar o Sistema de Build

Identifique a ferramenta de build do projeto e execute o build:

| Indicador | Comando de Build |
|-----------|---------------|
| `package.json` com script `build` | `npm run build` ou `pnpm build` |
| `tsconfig.json` (somente TypeScript) | `npx tsc --noEmit` |
| `Cargo.toml` | `cargo build 2>&1` |
| `pom.xml` | `mvn compile` |
| `build.gradle` | `./gradlew compileJava` |
| `go.mod` | `go build ./...` |
| `pyproject.toml` | `python -m compileall -q .` ou `mypy .` |

## Passo 2: Analisar e Agrupar Erros

1. Execute o comando de build e capture o stderr
2. Agrupe os erros por caminho de arquivo
3. Ordene por ordem de dependência (corrija imports/tipos antes de erros de lógica)
4. Conte o total de erros para acompanhamento de progresso

## Passo 3: Loop de Correção (Um Erro por Vez)

Para cada erro:

1. **Leia o arquivo** — Use a tool Read para ver o contexto do erro (10 linhas ao redor do erro)
2. **Diagnostique** — Identifique a causa raiz (import faltando, tipo errado, erro de sintaxe)
3. **Corrija minimamente** — Use a tool Edit para a menor mudança que resolve o erro
4. **Reexecute o build** — Verifique se o erro sumiu e se nenhum novo erro foi introduzido
5. **Vá para o próximo** — Continue com os erros restantes

## Passo 4: Guardrails

Pare e pergunte ao usuário se:
- Uma correção introduzir **mais erros do que resolve**
- O **mesmo erro persistir após 3 tentativas** (provavelmente um problema mais profundo)
- A correção exigir **mudanças arquiteturais** (não apenas uma correção de build)
- Os erros de build vierem de **dependências faltando** (precisa de `npm install`, `cargo add`, etc.)

## Passo 5: Resumo

Mostre os resultados:
- Erros corrigidos (com caminhos de arquivo)
- Erros restantes (se houver)
- Novos erros introduzidos (deve ser zero)
- Próximos passos sugeridos para problemas não resolvidos

## Estratégias de Recuperação

| Situação | Ação |
|-----------|--------|
| Módulo/import faltando | Verifique se o pacote está instalado; sugira comando de instalação |
| Incompatibilidade de tipos | Leia ambas as definições de tipo; corrija o tipo mais restrito |
| Dependência circular | Identifique o ciclo com o grafo de imports; sugira extração |
| Conflito de versão | Verifique `package.json` / `Cargo.toml` para restrições de versão |
| Má configuração da ferramenta de build | Leia o arquivo de config; compare com os defaults funcionais |

Corrija um erro por vez para mais segurança. Prefira diffs mínimos a refatorações.
