---
paths:
  - "**/*.rb"
  - "**/*.rake"
  - "**/Gemfile"
  - "**/app/**/*.erb"
  - "**/config/routes.rb"
---
# Padrões do Ruby

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Ruby e Rails.

## O Jeito Rails Primeiro

- Comece com o MVC simples do Rails e as convenções do Active Record para funcionalidades pequenas e médias.
- Introduza service objects, query objects, form objects, decorators ou presenters quando a fronteira model/controller estiver carregando múltiplas responsabilidades.
- Nomeie objetos extraídos pela operação de negócio que realizam, não por camadas genéricas como `Manager` ou `Processor`.

## Persistência

- Prefira PostgreSQL para apps Rails de produção multi-host, a menos que a plataforma existente tenha um motivo claro para MySQL ou SQLite.
- Trate os padrões do Rails 8 baseados em SQLite como viáveis para deployments single-host ou modestos, não como uma escolha automática para sistemas multi-serviço compartilhados.
- Mantenha SQL bruto atrás de query objects ou scopes de model e parametrize todo valor dinâmico.

## Background Jobs e Serviços de Runtime

- Use o **Solid Queue** para apps Rails 8 greenfield com throughput modesto e necessidades de deployment simples.
- Use o **Sidekiq** quando o app precisa de observabilidade madura, alto throughput, infraestrutura Redis existente ou funcionalidades Pro/Enterprise.
- Use **Solid Cache** e **Solid Cable** quando o modelo de deployment deles combinar com o app; use Redis quando comportamento compartilhado entre serviços, alto fanout ou estruturas de dados avançadas importarem.

## Frontend

- Prefira **Hotwire** com Turbo, Stimulus, Importmap e Propshaft para apps Rails renderizados no servidor.
- Use React, Vue, Inertia.js ou uma SPA separada quando a complexidade de interação, a arquitetura de produto existente ou a propriedade do time justificarem a superfície de cliente extra.
- Mantenha view components, partials e presenters focados em decisões de renderização; mantenha persistência e autorização fora dos templates.

## Autenticação

- Use o gerador de autenticação do Rails 8 para necessidades diretas de autenticação por sessão e redefinição de senha.
- Use Devise ou outro sistema de autenticação estabelecido quando os requisitos incluem OAuth, MFA, fluxos confirmable/lockable, autenticação multi-model ou uma grande base existente de Devise.

## Referência

Veja a skill: `backend-patterns` para fronteiras de service e padrões de adapter.
