---
paths:
  - "**/*.rb"
  - "**/*.rake"
  - "**/Gemfile"
  - "**/test/**/*.rb"
  - "**/spec/**/*.rb"
  - "**/config/routes.rb"
---
# Testes em Ruby

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Ruby e Rails.

## Framework

- Use **Minitest** quando a aplicação Rails segue a pilha de testes padrão do Rails.
- Use **RSpec** quando ele já está estabelecido no projeto ou a equipe tem convenções de produção explícitas em torno dele.
- Não misture Minitest e RSpec dentro da mesma área de funcionalidade sem um motivo de migração.

## Pirâmide de Testes

- Coloque comportamento de domínio rápido em testes de model, service, query, policy e job.
- Use testes de request/controller para contratos HTTP, comportamento de autenticação, redirecionamentos, códigos de status e formatos de resposta.
- Use testes de sistema com Capybara apenas para fluxos críticos de navegador; mantenha-os focados e estáveis.
- Cubra jobs em segundo plano com testes unitários para comportamento e testes de integração para contratos de fila/enfileiramento.

## Fixtures e Factories

- Use Fixtures do Rails quando elas são o padrão do projeto e o grafo de dados é pequeno.
- Use `factory_bot` quando os cenários precisam de construção explícita de objetos ou traits complexos.
- Mantenha os dados de teste próximos do comportamento que está sendo verificado; evite Fixtures globais que escondem o custo de configuração.

## Comandos

Prefira comandos locais ao projeto:

```bash
bin/rails test
bin/rails test test/models/user_test.rb
bundle exec rspec
bundle exec rspec spec/models/user_spec.rb
```

## Cobertura

- Use SimpleCov quando a cobertura é exigida; mantenha os limiares no CI e evite manipular a cobertura de branches com testes de baixo valor.
- Adicione testes de regressão para correções de bugs antes de alterar código de produção.

## Referência

Veja a skill: `tdd-workflow` para o ciclo RED -> GREEN -> REFACTOR de todo o repositório.
