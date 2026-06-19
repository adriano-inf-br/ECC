---
name: angular-developer
description: Gera código Angular e oferece orientação arquitetural. Acione ao criar projetos, componentes ou serviços, ou para boas práticas sobre reatividade (signals, linkedSignal, resource), formulários, injeção de dependência, roteamento, SSR, acessibilidade (ARIA), animações, estilização (estilos de componente, Tailwind CSS), testes ou ferramentas de CLI.
metadata:
  origin: ECC
---

# Diretrizes para Desenvolvedor Angular

## Quando Ativar

- Trabalhar em qualquer projeto ou base de código Angular
- Criar ou fazer scaffold de um novo projeto, aplicação ou biblioteca Angular
- Gerar componentes, serviços, diretivas, pipes, guards ou resolvers
- Implementar reatividade com Angular Signals, `linkedSignal` ou `resource`
- Trabalhar com formulários Angular (signal forms, reactive forms ou template-driven)
- Configurar injeção de dependência, roteamento, lazy loading ou route guards
- Adicionar acessibilidade (ARIA), animações ou estilização de componentes
- Escrever ou depurar testes específicos do Angular (unitários, component harness, E2E)
- Configurar as ferramentas de CLI do Angular ou o servidor MCP do Angular

1. Sempre analise a versão do Angular do projeto antes de fornecer orientação, pois as boas práticas e os recursos disponíveis podem variar significativamente entre versões. Se estiver criando um novo projeto com o Angular CLI, não especifique uma versão a menos que solicitado pelo usuário.

2. Ao gerar código, siga o guia de estilo e as boas práticas do Angular para manutenibilidade e desempenho. Use o Angular CLI para fazer scaffold de componentes, serviços, diretivas, pipes e rotas a fim de garantir consistência.

3. Assim que terminar de gerar o código, execute `ng build` para garantir que não há erros de build. Se houver erros, analise as mensagens de erro e corrija-os antes de prosseguir. Não pule esta etapa, pois ela é crítica para garantir que o código gerado está correto e funcional.

## Criando Novos Projetos

Se nenhuma diretriz for fornecida pelo usuário, use estes padrões ao criar um novo projeto Angular:

1. Use a versão estável mais recente do Angular, a menos que o usuário especifique o contrário.
2. Prefira Signal Forms para novos projetos somente quando a versão alvo do Angular as suportar. [Saiba mais](references/signal-forms.md).

**Regras de Execução para `ng new`:**
Ao receber a tarefa de criar um novo projeto Angular, você deve determinar o comando de execução correto seguindo estes passos rigorosos:

**Passo 1: Verifique se há uma versão explícita do usuário.**

- **SE** o usuário solicitar uma versão específica (ex.: Angular 15), ignore as instalações locais e use estritamente `npx`.
- **Comando:** `npx @angular/cli@<requested_version> new <project-name>`

**Passo 2: Verifique se há uma instalação existente do Angular.**

- **SE** nenhuma versão específica for solicitada, execute `ng version` no terminal para verificar se o Angular CLI já está instalado no sistema.
- **SE** o comando for bem-sucedido e retornar uma versão instalada, use a instalação local/global diretamente.
- **Comando:** `ng new <project-name>`

**Passo 3: Fallback para a Mais Recente.**

- **SE** nenhuma versão específica for solicitada E o comando `ng version` falhar (indicando que não existe instalação do Angular), você deve usar `npx` para obter a versão mais recente.
- **Comando:** `npx @angular/cli@latest new <project-name>`

## Componentes

Ao trabalhar com componentes Angular, consulte as seguintes referências de acordo com a tarefa:

- **Fundamentos**: Anatomia, metadados, conceitos centrais e controle de fluxo no template (@if, @for, @switch). Leia [components.md](references/components.md)
- **Inputs**: Inputs baseados em signal, transforms e model inputs. Leia [inputs.md](references/inputs.md)
- **Outputs**: Outputs baseados em signal e boas práticas de eventos customizados. Leia [outputs.md](references/outputs.md)
- **Host Elements**: Host bindings e injeção de atributos. Leia [host-elements.md](references/host-elements.md)

Se você precisar de documentação mais aprofundada não encontrada nas referências acima, leia a documentação em `https://angular.dev/guide/components`.

## Reatividade e Gerenciamento de Dados

Ao gerenciar estado e reatividade de dados, use Angular Signals e consulte as seguintes referências:

- **Visão Geral de Signals**: Conceitos centrais de signal (`signal`, `computed`), contextos reativos e `untracked`. Leia [signals-overview.md](references/signals-overview.md)
- **Estado Dependente (`linkedSignal`)**: Criação de estado gravável vinculado a signals de origem. Leia [linked-signal.md](references/linked-signal.md)
- **Reatividade Assíncrona (`resource`)**: Busca de dados assíncronos diretamente no estado de signal. Leia [resource.md](references/resource.md)
- **Efeitos Colaterais (`effect`)**: Logging, manipulação de DOM por terceiros (`afterRenderEffect`) e quando NÃO usar effects. Leia [effects.md](references/effects.md)

## Formulários

Na maioria dos casos para novos apps, **prefira signal forms**. Ao tomar uma decisão sobre formulários, analise o projeto e considere as seguintes diretrizes:

- Se a versão da aplicação suportar Signal Forms e este for um novo formulário, **prefira signal forms**.
- Para aplicações mais antigas ou formulários existentes, alinhe-se à estratégia de formulários atual da aplicação.

- **Signal Forms**: Use signals para o gerenciamento de estado do formulário. Leia [signal-forms.md](references/signal-forms.md)
- **Formulários template-driven**: Use para formulários simples. Leia [template-driven-forms.md](references/template-driven-forms.md)
- **Reactive forms**: Use para formulários complexos. Leia [reactive-forms.md](references/reactive-forms.md)

## Injeção de Dependência

Ao implementar injeção de dependência no Angular, siga estas diretrizes:

- **Fundamentos**: Visão geral de Injeção de Dependência, serviços e a função `inject()`. Leia [di-fundamentals.md](references/di-fundamentals.md)
- **Criando e Usando Serviços**: Criação de serviços, a opção `providedIn: 'root'` e injeção em componentes ou outros serviços. Leia [creating-services.md](references/creating-services.md)
- **Definindo Provedores de Dependência**: Provisão automática vs. manual, `InjectionToken`, `useClass`, `useValue`, `useFactory` e escopos. Leia [defining-providers.md](references/defining-providers.md)
- **Contexto de Injeção**: Onde `inject()` é permitido, `runInInjectionContext` e `assertInInjectionContext`. Leia [injection-context.md](references/injection-context.md)
- **Injetores Hierárquicos**: O `EnvironmentInjector` vs. `ElementInjector`, regras de resolução, modificadores (`optional`, `skipSelf`) e `providers` vs. `viewProviders`. Leia [hierarchical-injectors.md](references/hierarchical-injectors.md)

## Angular Aria

Ao construir componentes customizados acessíveis para qualquer um dos seguintes padrões: Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid, consulte a seguinte referência:

- **Componentes Angular Aria**: Construção de componentes headless e acessíveis (Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid) e estilização de atributos ARIA. Leia [angular-aria.md](references/angular-aria.md)

## Roteamento

Ao implementar navegação no Angular, consulte as seguintes referências:

- **Definir Rotas**: Caminhos de URL, segmentos estáticos vs. dinâmicos, wildcards e redirecionamentos. Leia [define-routes.md](references/define-routes.md)
- **Estratégias de Carregamento de Rotas**: Eager vs. lazy loading e carregamento sensível ao contexto. Leia [loading-strategies.md](references/loading-strategies.md)
- **Exibir Rotas com Outlets**: Uso de `<router-outlet>`, outlets aninhados e outlets nomeados. Leia [show-routes-with-outlets.md](references/show-routes-with-outlets.md)
- **Navegar para Rotas**: Navegação declarativa com `RouterLink` e navegação programática com `Router`. Leia [navigate-to-routes.md](references/navigate-to-routes.md)
- **Controlar o Acesso a Rotas com Guards**: Implementação de `CanActivate`, `CanMatch` e outros guards para segurança. Leia [route-guards.md](references/route-guards.md)
- **Data Resolvers**: Pré-busca de dados antes da ativação da rota com `ResolveFn`. Leia [data-resolvers.md](references/data-resolvers.md)
- **Ciclo de Vida e Eventos do Router**: Ordem cronológica dos eventos de navegação e depuração. Leia [router-lifecycle.md](references/router-lifecycle.md)
- **Estratégias de Renderização**: CSR, SSG (Prerendering) e SSR com hidratação. Leia [rendering-strategies.md](references/rendering-strategies.md)
- **Animações de Transição de Rota**: Habilitação e personalização da View Transitions API. Leia [route-animations.md](references/route-animations.md)

Se você precisar de documentação mais aprofundada ou mais contexto, visite o [guia oficial de Roteamento do Angular](https://angular.dev/guide/routing).

## Estilização e Animações

Ao implementar estilização e animações no Angular, consulte as seguintes referências:

- **Usando Tailwind CSS com Angular**: Integração do Tailwind CSS em projetos Angular. Leia [tailwind-css.md](references/tailwind-css.md)
- **Angular Animations**: Uso de CSS nativo (recomendado) ou da DSL legada para efeitos dinâmicos. Leia [angular-animations.md](references/angular-animations.md)
- **Estilizando componentes**: Boas práticas para estilos de componente e encapsulamento. Leia [component-styling.md](references/component-styling.md)

## Testes

Ao escrever ou atualizar testes, consulte as seguintes referências de acordo com a tarefa:

- **Fundamentos**: Boas práticas para testes unitários, padrões assíncronos e `TestBed`. Leia [testing-fundamentals.md](references/testing-fundamentals.md)
- **Component Harnesses**: Padrões padronizados para interação robusta com componentes. Leia [component-harnesses.md](references/component-harnesses.md)
- **Testes de Router**: Uso do `RouterTestingHarness` para testes de navegação confiáveis. Leia [router-testing.md](references/router-testing.md)
- **Testes End-to-End (E2E)**: Boas práticas para testes E2E com Cypress ou Playwright. Leia [e2e-testing.md](references/e2e-testing.md)

## Ferramentas

Ao trabalhar com as ferramentas do Angular, consulte as seguintes referências:

- **Angular CLI**: Criação de aplicações, geração de código (componentes, rotas, serviços), serve e build. Leia [cli.md](references/cli.md)
- **Servidor MCP do Angular**: Ferramentas disponíveis, configuração e recursos experimentais. Leia [mcp.md](references/mcp.md)

## Anti-Padrões

- Usar `null` ou `undefined` como valores iniciais de campos de signal form — use `''`, `0` ou `[]`
- Acessar flags de estado de campo do formulário sem chamar o campo primeiro: `form.field.valid()` — use `form.field().valid()`
- Iniciar novos formulários com APIs de formulário mais antigas quando a versão alvo do Angular suporta Signal Forms
- Definir os atributos HTML `min`, `max`, `value`, `disabled` ou `readonly` em inputs `[formField]` — defina-os como regras de schema
- Chamar `inject()` fora de um contexto de injeção — use `runInInjectionContext` quando necessário
- Usar `effect()` para estado derivado que deveria usar `computed()`
- Referenciar `$parent.$index` em loops `@for` aninhados — o Angular não suporta `$parent`; use `let outerIdx = $index`

## Skills Relacionadas

- `tdd-workflow` — fluxo de trabalho de desenvolvimento orientado a testes aplicável a componentes e serviços Angular
- `security-review` — checklist de segurança para aplicações web, incluindo preocupações específicas do Angular
- `frontend-patterns` — padrões gerais de frontend para contexto sobre abordagens React/Next.js
