---
description: Identifique e remova código morto com segurança, com verificação após cada alteração.
---

# Refactor Clean

Identifique e remova código morto com segurança, com verificação por testes em cada etapa.

## Etapa 1: Detectar Código Morto

Execute ferramentas de análise conforme o tipo de projeto:

| Ferramenta | O Que Encontra | Comando |
|------|--------------|---------|
| knip | Exports, arquivos e dependências não utilizados | `npx knip` |
| depcheck | Dependências npm não utilizadas | `npx depcheck` |
| ts-prune | Exports TypeScript não utilizados | `npx ts-prune` |
| vulture | Código Python não utilizado | `vulture src/` |
| deadcode | Código Go não utilizado | `deadcode ./...` |
| cargo-udeps | Dependências Rust não utilizadas | `cargo +nightly udeps` |

Se nenhuma ferramenta estiver disponível, use Grep para encontrar exports com zero imports:
```
# Find exports, then check if they're imported anywhere
```

## Etapa 2: Categorizar as Descobertas

Classifique as descobertas em níveis de segurança:

| Nível | Exemplos | Ação |
|------|----------|--------|
| **SAFE** | Utilitários, helpers de teste e funções internas não utilizados | Apague com confiança |
| **CAUTION** | Componentes, rotas de API, middleware | Verifique se não há imports dinâmicos ou consumidores externos |
| **DANGER** | Arquivos de configuração, pontos de entrada, definições de tipo | Investigue antes de tocar |

## Etapa 3: Laço de Remoção Segura

Para cada item SAFE:

1. **Execute a suíte de testes completa** — Estabeleça uma linha de base (tudo verde)
2. **Apague o código morto** — Use a tool Edit para remoção cirúrgica
3. **Reexecute a suíte de testes** — Verifique se nada quebrou
4. **Se os testes falharem** — Reverta imediatamente com `git checkout -- <file>` e pule este item
5. **Se os testes passarem** — Vá para o próximo item

## Etapa 4: Tratar Itens CAUTION

Antes de apagar itens CAUTION:
- Procure por imports dinâmicos: `import()`, `require()`, `__import__`
- Procure por referências em string: nomes de rota, nomes de componente em configurações
- Verifique se está sendo exportado por uma API pública de pacote
- Verifique se não há consumidores externos (cheque os dependentes, se publicado)

## Etapa 5: Consolidar Duplicatas

Após remover o código morto, procure por:
- Funções quase duplicadas (>80% semelhantes) — mescle em uma só
- Definições de tipo redundantes — consolide
- Funções wrapper que não agregam valor — torne-as inline
- Reexports que não servem a nenhum propósito — remova a indireção

## Etapa 6: Resumo

Reporte os resultados:

```
Dead Code Cleanup
──────────────────────────────
Deleted:   12 unused functions
           3 unused files
           5 unused dependencies
Skipped:   2 items (tests failed)
Saved:     ~450 lines removed
──────────────────────────────
All tests passing PASS:
```

## Regras

- **Nunca apague sem rodar os testes primeiro**
- **Uma remoção por vez** — Alterações atômicas facilitam o rollback
- **Pule se estiver incerto** — Melhor manter código morto do que quebrar a produção
- **Não refatore enquanto limpa** — Separe as preocupações (limpe primeiro, refatore depois)
