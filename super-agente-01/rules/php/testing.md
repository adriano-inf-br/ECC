---
paths:
  - "**/*.php"
  - "**/phpunit.xml"
  - "**/phpunit.xml.dist"
  - "**/composer.json"
---
# Testes do PHP

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de PHP.

## Framework

Use **PHPUnit** como framework de teste padrão. Se o **Pest** estiver configurado no projeto, prefira o Pest para novos testes e evite misturar frameworks.

## Cobertura

```bash
vendor/bin/phpunit --coverage-text
# ou
vendor/bin/pest --coverage
```

Prefira **pcov** ou **Xdebug** em CI, e mantenha os limiares de cobertura no CI em vez de como conhecimento tribal.

## Organização dos Testes

- Separe testes unitários rápidos dos testes de integração com framework/banco de dados.
- Use factories/builders para fixtures em vez de grandes arrays escritos à mão.
- Mantenha os testes de HTTP/controller focados em transporte e validação; mova as regras de negócio para testes no nível de serviço.

## Inertia

Se o projeto usa Inertia.js, prefira `assertInertia` com `AssertableInertia` para verificar nomes de componentes e props em vez de asserções de JSON bruto.

## Referência

Veja a skill: `tdd-workflow` para o loop RED -> GREEN -> REFACTOR de todo o repositório.
Veja a skill: `laravel-tdd` para padrões de teste específicos do Laravel (PHPUnit e Pest).
