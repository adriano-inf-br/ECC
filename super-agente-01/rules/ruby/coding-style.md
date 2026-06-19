---
paths:
  - "**/*.rb"
  - "**/*.rake"
  - "**/Gemfile"
  - "**/*.gemspec"
  - "**/config.ru"
---
# Estilo de Código Ruby

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Ruby e Rails.

## Padrões

- Tenha como alvo o **Ruby 3.3+** para novos trabalhos com Rails, a menos que o projeto já fixe um runtime suportado mais antigo.
- Habilite o **YJIT** em produção somente após medir tempo de boot, memória e throughput de requisições/jobs.
- Adicione `# frozen_string_literal: true` a novos arquivos Ruby quando o projeto usa essa convenção.
- Prefira Ruby claro a metaprogramação esperta; isole código pesado em DSL atrás de fronteiras estreitas e testadas.

## Formatação e Linting

- Use a configuração do RuboCop versionada no projeto. Para apps Rails 8+, comece a partir de `rubocop-rails-omakase` e customize apenas onde a base de código tem uma convenção real.
- Mantenha os comandos de formatter/linter atrás de binstubs ou scripts para que o CI e as execuções locais coincidam:

```bash
bundle exec rubocop
bundle exec rubocop -A
```

- Não silencie cops inline a menos que a exceção seja estreita, documentada e mais difícil de expressar de forma limpa no código.

## Estilo Rails

- Siga as convenções de nomenclatura e diretório do Rails antes de adicionar estrutura customizada.
- Mantenha os controllers focados em transporte: autenticação, autorização, tratamento de parâmetros, formato da resposta.
- Coloque comportamento de domínio reutilizável em models, concerns, service objects, query objects ou form objects com base na complexidade real, não como cerimônia padrão.
- Prefira `bin/rails`, `bin/rake` e binstubs versionados em vez de comandos instalados globalmente.

## Tratamento de Erros

- Faça rescue de exceções específicas. Evite blocos amplos de `rescue StandardError`, a menos que eles relancem ou preservem contexto suficiente para os operadores.
- Use `ActiveSupport::Notifications` ou o logger da aplicação para eventos operacionais; não deixe `puts`, `pp` ou `debugger` em código de aplicação commitado.

## Referência

Veja a skill: `backend-patterns` para orientação mais ampla de camadas de service/repository.
