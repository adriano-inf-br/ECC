---
paths:
  - "**/*.rb"
  - "**/*.rake"
  - "**/Gemfile"
  - "**/Gemfile.lock"
  - "**/config/routes.rb"
---
# Hooks do Ruby

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Ruby e Rails.

## Hooks PostToolUse

Configure hooks locais do projeto para preferir binstubs e ferramentas versionadas:

- **RuboCop**: execute `bundle exec rubocop -A <file>` ou o comando de formatter mais seguro do projeto após edições em Ruby.
- **Brakeman**: execute `bundle exec brakeman --no-progress` após mudanças no Rails sensíveis à segurança.
- **Testes**: execute o comando `bin/rails test ...` ou `bundle exec rspec ...` mais estreito que corresponda aos arquivos alterados.
- **Bundler audit**: execute `bundle exec bundle-audit check --update` quando `Gemfile` ou `Gemfile.lock` mudar e o projeto tiver o bundler-audit instalado.

## Avisos

- Avise sobre chamadas commitadas de `debugger`, `binding.irb`, `binding.pry`, `puts`, `pp` ou `p` em código de aplicação.
- Avise quando uma edição desabilita a proteção CSRF, expande mass-assignment ou adiciona SQL bruto sem parametrização.
- Avise quando uma migration altera dados de forma destrutiva sem um caminho reversível ou um plano de rollout documentado.

## Sugestões de Gate no CI

```bash
bundle exec rubocop
bundle exec brakeman --no-progress
bin/rails test
bundle exec rspec
```

Use apenas os comandos presentes no projeto; não instale novas dependências de hook sem a aprovação do mantenedor.
