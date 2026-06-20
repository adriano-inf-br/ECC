---
paths:
  - "**/*.php"
  - "**/composer.json"
---
# Padrões do PHP

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de PHP.

## Controllers Enxutos, Serviços Explícitos

- Mantenha os controllers focados em transporte: autenticação, validação, serialização, códigos de status.
- Mova as regras de negócio para serviços de aplicação/domínio que sejam fáceis de testar sem o bootstrap de HTTP.

## DTOs e Objetos de Valor

- Substitua arrays associativos com estrutura pesada por DTOs para requisições, comandos e payloads de API externa.
- Use objetos de valor para dinheiro, identificadores, intervalos de datas e outros conceitos restritos.

## Injeção de Dependência

- Dependa de interfaces ou contratos de serviço estreitos, não de globais do framework.
- Passe os colaboradores pelos construtores para que os serviços sejam testáveis sem buscas por service locator.

## Fronteiras

- Isole os models do ORM das decisões de domínio quando a camada de model estiver fazendo mais do que persistência.
- Envolva SDKs de terceiros atrás de pequenos adaptadores para que o resto da base de código dependa do seu contrato, não do deles.

## Referência

Veja a skill: `api-design` para convenções de endpoint e orientações sobre o formato de resposta.
Veja a skill: `laravel-patterns` para orientações de arquitetura específicas do Laravel.
