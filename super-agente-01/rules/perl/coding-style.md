---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Estilo de Código Perl

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Perl.

## Padrões

- Sempre `use v5.36` (habilita `strict`, `warnings`, `say`, assinaturas de subrotina)
- Use assinaturas de subrotina — nunca desempacote `@_` manualmente
- Prefira `say` em vez de `print` com novas linhas explícitas

## Imutabilidade

- Use **Moo** com `is => 'ro'` e `Types::Standard` para todos os atributos
- Nunca use hashrefs "blessed" diretamente — sempre use accessors do Moo/Moose
- **Observação sobre override de OO**: atributos `has` do Moo com `builder` ou `default` são aceitáveis para valores somente-leitura computados

## Formatação

Use **perltidy** com estas configurações:

```
-i=4    # indentação de 4 espaços
-l=100  # comprimento de linha de 100 caracteres
-ce     # cuddled else (else aninhado junto à chave)
-bar    # chave de abertura sempre à direita
```

## Linting

Use **perlcritic** na severidade 3 com os temas: `core`, `pbp`, `security`.

```bash
perlcritic --severity 3 --theme 'core || pbp || security' lib/
```

## Referência

Veja a skill: `perl-patterns` para idiomas modernos abrangentes de Perl e melhores práticas.
