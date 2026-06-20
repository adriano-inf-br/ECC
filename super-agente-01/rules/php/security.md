---
paths:
  - "**/*.php"
  - "**/composer.lock"
  - "**/composer.json"
---
# Segurança do PHP

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de PHP.

## Entrada e Saída

- Valide a entrada de requisição na fronteira do framework (`FormRequest`, Symfony Validator ou validação explícita de DTO).
- Faça escape da saída em templates por padrão; trate a renderização de HTML bruto como uma exceção que deve ser justificada.
- Nunca confie em query params, cookies, headers ou metadados de arquivos enviados sem validação.

## Segurança de Banco de Dados

- Use prepared statements (`PDO`, Doctrine, query builder do Eloquent) para todas as consultas dinâmicas.
- Evite construir SQL com strings em controllers/views.
- Limite cuidadosamente a atribuição em massa (mass-assignment) do ORM e faça whitelist dos campos graváveis.

## Segredos e Dependências

- Carregue segredos a partir de variáveis de ambiente ou de um gerenciador de segredos, nunca de arquivos de configuração versionados.
- Execute `composer audit` em CI e revise a confiança no mantenedor do novo pacote antes de adicionar dependências.
- Fixe versões maiores deliberadamente e remova pacotes abandonados rapidamente.

## Segurança de Autenticação e Sessão

- Use `password_hash()` / `password_verify()` para armazenamento de senhas.
- Regenere os identificadores de sessão após autenticação e mudanças de privilégio.
- Imponha proteção CSRF em requisições web que alteram estado.

## Referência

Veja a skill: `laravel-security` para orientações de segurança específicas do Laravel.
