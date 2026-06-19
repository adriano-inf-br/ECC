---
name: production-audit
description: Auditoria de prontidão para produção baseada em evidências locais para apps em produção, revisões pré-lançamento, verificações pós-merge e perguntas do tipo "o que quebra em prod?" sem enviar dados do repositório a um serviço de auditoria externo.
metadata:
  origin: community
---

# Production Audit

Use esta skill quando o usuário perguntar se uma aplicação está pronta para ser entregue, o que
poderia quebrar em produção, ou o que precisa ser corrigido antes de um lançamento. Esta é uma
reescrita segura para mantenedores da ideia de auditoria de produção da comunidade: mantém a
lente útil de prontidão para produção e remove a execução externa não fixada e o compartilhamento
de dados com terceiros.

## Quando Usar

- O usuário pergunta "está pronto para produção", "o que quebraria em prod", "o que perdemos",
  "audite este repositório" ou "pronto para entregar?"
- Uma feature foi mergeada e precisa de uma passagem de risco pré-deploy ou pós-merge.
- Um lançamento público, demo, rollout de cliente ou apresentação para investidores está próximo.
- O CI está verde, mas o usuário quer risco de produção, não apenas status de teste.
- Uma URL implantada, branch de release, PR ou checkout atual está disponível para coleta de evidências.

## Quando Não Usar

- Durante a implementação ativa quando a lente certa é a codificação segura em nível de linha;
  use `security-review` primeiro.
- Para bibliotecas puras, templates, repositórios somente de documentação ou scaffolds, a menos que o usuário
  queira prontidão de empacotamento/release em vez de prontidão de aplicação.
- Quando o usuário pede uma auditoria de compliance formal. Esta skill é triagem de engenharia,
  não certificação legal, financeira, médica ou regulatória.
- Quando a única evidência disponível é uma ideia de produto sem repositório, implantação,
  CI ou superfície de runtime.

## Como Funciona

Construa a auditoria a partir de evidências locais e autorizadas pelo usuário. Não execute código
remoto não fixado, não faça upload do conteúdo do repositório para serviços de terceiros, nem chame
scanners externos, a menos que o usuário aprove explicitamente essa ferramenta específica e o fluxo de dados.

Use esta ordem:

1. Estabeleça a superfície de release.
2. Leia alterações recentes e o estado atual do branch.
3. Inspecione os limites de runtime, auth, dados, pagamento, job em background, IA e implantação
   que realmente existem no repositório.
4. Verifique CI, testes, migrações, documentação de ambiente e caminho de rollback.
5. Produza uma recomendação curta de entregar/bloquear com correções específicas.

## Lista de Verificação de Evidências

Comece com sinais baratos e locais:

```text
git status --short --branch
git log --oneline --decorate -20
git diff --stat origin/main...HEAD
```

Em seguida, inspecione a superfície específica do projeto:

- Scripts de pacote, workflows de CI, scripts de release, arquivos Docker e manifestos de implantação.
- Rotas de API, webhooks, middleware de auth, workers em background, cron jobs e migrações de banco de dados.
- Documentação de variáveis de ambiente e verificações de inicialização.
- Hooks de observabilidade, relatório de erros, logs, health checks e dashboards.
- Instruções de rollback, seed, migração e backfill.
- Cobertura E2E para os caminhos de usuário mais importantes.

Se uma URL implantada estiver no escopo, use verificações de browser ou HTTP apenas contra essa URL
e evite ações credenciadas, a menos que o usuário forneça uma conta de teste segura.

## Lentes de Risco

### Segurança e Auth

- Rotas públicas, rotas de API e rotas de admin estão claramente separadas?
- Auth e autorização são aplicados no lado do servidor?
- Segredos estão fora de bundles de cliente, logs, saída de exemplo e arquivos commitados?
- Limites de taxa, proteções CSRF, política CORS e validação de upload estão presentes
  onde a app precisa deles?
- A superfície de IA ou agent se defende contra injeção de Prompt, abuso de ferramentas e
  conteúdo não confiável cruzando para ações privilegiadas?

### Integridade de Dados

- As migrações executam corretamente para frente e têm um plano de rollback ou recuperação?
- Migrações destrutivas, backfills e importações de dados são encenados com segurança?
- As políticas de banco de dados, grants e limites de service-role correspondem ao modelo de
  multilocação da app?
- As tentativas são idempotentes para escritas, jobs e handlers de webhook?

### Pagamentos e Webhooks

- Assinaturas de webhook são verificadas antes de analisar campos de payload confiáveis?
- Cada webhook de pagamento, assinatura ou fulfillment é idempotente?
- Replay, entrega duplicada e entrega fora de ordem são tratados?
- Credenciais de modo de teste e modo ao vivo estão separadas?

### Operações

- A app pode iniciar a partir de um checkout limpo usando comandos documentados?
- Variáveis de ambiente obrigatórias são nomeadas, validadas e falham rapidamente?
- Existe um health check que prova que as dependências estão acessíveis?
- Os caminhos de deploy, rollback e responsável por incidentes estão documentados?
- Os logs são úteis sem vazar segredos ou dados pessoais?

### Experiência do Usuário

- Os caminhos críticos do lançamento são cobertos em desktop e mobile?
- Os formulários são utilizáveis em mobile sem zoom de entrada, sobreposição de layout ou
  estados de envio bloqueados?
- Os estados de carregamento, vazio, erro e permissão negada informam ao usuário o que aconteceu?
- Existe um caminho de suporte ou recuperação quando uma operação crítica falha?

## Pontuação

Use pontuações para forçar priorização, não para implicar certeza matemática.

| Banda | Pontuação | Significado |
| --- | --- | --- |
| Bloqueado | 0-49 | Não entregue até que os principais riscos sejam corrigidos |
| Arriscado | 50-69 | Entregue apenas com um rollout pequeno ou beta interno |
| Lançável com Ressalvas | 70-84 | Entregue se os proprietários aceitarem os riscos listados |
| Forte | 85-100 | Sem bloqueadores óbvios de lançamento a partir das evidências disponíveis |

Limite a pontuação em `69` se qualquer um desses for verdadeiro:

- Autenticação ou autorização está faltando em dados sensíveis.
- Webhooks de pagamento ou fulfillment não são idempotentes.
- As migrações necessárias não podem ser executadas com segurança.
- Segredos estão expostos em bundles de cliente, logs ou arquivos commitados.
- Não há caminho de rollback para um release de alto impacto.

Limite a pontuação em `84` se o CI não estiver verde ou o caminho crítico do lançamento não tiver sido
testado end-to-end.

## Formato de Saída

Comece com uma frase:

```text
Auditoria de produção: 76/100, lançável com ressalvas, com idempotência de webhook e documentação de rollback como os dois riscos a corrigir antes do lançamento público.
```

Em seguida, liste:

- `Bloqueadores`: itens obrigatórios antes do deploy.
- `Correções de alto valor`: próximas correções se o usuário quiser melhorar a pontuação.
- `Evidências verificadas`: arquivos, comandos, CI, URL implantada ou PRs inspecionados.
- `Evidências faltando`: o que mudaria a confiança se fornecido.
- `Próxima ação`: uma correção concreta ou etapa de verificação.

Mantenha os pontos fortes curtos. O usuário perguntou sobre prontidão, portanto a resposta útil é o
risco restante e a próxima ação.

## Exemplo

Usuário:

```text
isso está pronto para entregar?
```

Resposta:

```text
Auditoria de produção: 68/100, arriscado, porque os webhooks do Stripe são verificados mas não são idempotentes e não há nota de rollback para a migração pendente.

Bloqueadores:
- Adicionar idempotência para `checkout.session.completed` antes de cumprir pedidos.
- Escrever e testar o caminho de rollback para `20260511_add_billing_state.sql`.

Correções de alto valor:
- Adicionar um health check que verifica a acessibilidade do banco de dados e do provedor de pagamento.
- Adicionar um caminho E2E para upgrade, fulfillment de webhook e atualização da página de billing.

Evidências verificadas:
- `api/stripe/webhook.ts`
- `db/migrations/20260511_add_billing_state.sql`
- Execução do GitHub Actions para o branch de release

Próxima ação: Quer que eu corrija a idempotência do webhook primeiro?
```

## Anti-Padrões

- Executar `npx <package>@latest` ou um scanner remoto como o caminho padrão de auditoria.
- Fazer upload de código-fonte, segredos, dados de clientes ou topologia privada para um serviço de auditoria externo sem aprovação explícita.
- Produzir uma pontuação sem nomear as evidências verificadas.
- Tratar CI verde como prontidão para produção.
- Terminar com um genérico "me diga o que você quer fazer."

## Veja Também

- Skill: `security-review`
- Skill: `deployment-patterns`
- Skill: `e2e-testing`
- Skill: `tdd-workflow`
- Skill: `verification-loop`
