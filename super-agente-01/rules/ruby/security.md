---
paths:
  - "**/*.rb"
  - "**/*.rake"
  - "**/Gemfile"
  - "**/Gemfile.lock"
  - "**/config/routes.rb"
  - "**/config/credentials*.yml.enc"
---
# Segurança do Ruby

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Ruby e Rails.

## Padrões do Rails

- Mantenha a proteção CSRF habilitada para requisições de navegador que alteram estado.
- Use strong parameters ou objetos de fronteira tipados antes do mass assignment.
- Armazene segredos nas credentials do Rails, em variáveis de ambiente ou em um gerenciador de segredos. Nunca faça commit de chaves em texto puro, tokens, credenciais privadas ou valores copiados de `.env`.

## SQL e Active Record

- Prefira as APIs de query do Active Record e SQL parametrizado.
- Nunca interpole valores de requisição, cookie, header, job ou webhook em strings SQL.
- Defina o escopo dos callbacks de model com cuidado; efeitos colaterais sensíveis à segurança devem ser explícitos e cobertos por testes.

## Autenticação e Sessões

- Use o gerador de autenticação do Rails 8 para autenticação simples por sessão, ou Devise quando OAuth, MFA, confirmable, lockable, autenticação multi-model ou convenções existentes de Devise forem necessárias.
- Rotacione as sessões após o login e mudanças de privilégio.
- Proteja fluxos de recuperação de conta com expiração, tokens de uso único, rate limiting e logging de auditoria.

## Dependências

- Execute verificações de dependência quando o lockfile mudar:

```bash
bundle exec bundle-audit check --update
bundle exec brakeman --no-progress
```

- Revise novas gems quanto à atividade do mantenedor, risco de extensão nativa, dependências transitivas e se o mesmo comportamento pode ser implementado com o core do Rails.

## Segurança Web

- Escape a saída de template por padrão. Trate `html_safe`, `raw` e sanitizadores customizados como código sensível à segurança.
- Valide uploads de arquivo por content type, extensão, tamanho e destino de armazenamento.
- Trate background jobs, webhooks, mensagens do Action Cable e entradas de Turbo Stream como fronteiras não confiáveis.

## Referência

Veja a skill: `security-review` para padrões de revisão seguros por padrão.
