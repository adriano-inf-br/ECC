---
paths:
  - "**/*.php"
  - "**/composer.json"
---
# Estilo de Código PHP

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de PHP.

## Padrões

- Siga as convenções de formatação e nomenclatura do **PSR-12**.
- Prefira `declare(strict_types=1);` em código de aplicação.
- Use type hints escalares, tipos de retorno e propriedades tipadas em todo lugar em que código novo permitir.

## Imutabilidade

- Prefira DTOs e objetos de valor imutáveis para dados que cruzam fronteiras de serviço.
- Use propriedades `readonly` ou construtores imutáveis para payloads de requisição/resposta sempre que possível.
- Mantenha arrays para mapas simples; promova estruturas críticas para o negócio a classes explícitas.

## Formatação

- Use **PHP-CS-Fixer** ou **Laravel Pint** para formatação.
- Use **PHPStan** ou **Psalm** para análise estática.
- Mantenha os scripts do Composer versionados para que os mesmos comandos rodem localmente e em CI.

## Imports

- Adicione declarações `use` para todas as classes, interfaces e traits referenciadas.
- Evite depender do namespace global, a menos que o projeto explicitamente prefira nomes totalmente qualificados.

## Tratamento de Erros

- Lance exceções para estados excepcionais; evite retornar `false`/`null` como canais de erro ocultos em código novo.
- Converta a entrada do framework/requisição em DTOs validados antes que ela chegue à lógica de domínio.

## Referência

Veja a skill: `backend-patterns` para orientações mais amplas sobre camadas de serviço/repositório.
