---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Testes do Perl

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Perl.

## Framework

Use **Test2::V0** para novos projetos (não Test::More):

```perl
use Test2::V0;

is($result, 42, 'answer is correct');

done_testing;
```

## Runner

```bash
prove -l t/              # adiciona lib/ ao @INC
prove -lr -j8 t/         # recursivo, 8 jobs em paralelo
```

Sempre use `-l` para garantir que `lib/` esteja no `@INC`.

## Cobertura

Use **Devel::Cover** — meta de 80%+:

```bash
cover -test
```

## Mocking

- **Test::MockModule** — fazer mock de métodos em módulos existentes
- **Test::MockObject** — criar test doubles do zero

## Armadilhas

- Sempre encerre os arquivos de teste com `done_testing`
- Nunca esqueça a flag `-l` com `prove`

## Referência

Veja a skill: `perl-testing` para padrões detalhados de TDD em Perl com Test2::V0, prove e Devel::Cover.
