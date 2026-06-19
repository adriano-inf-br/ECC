# Descoberta de Instalação Seletiva do ECC 2.0

## Objetivo

Este documento transforma o requisito de instalação seletiva do mega plano de 11 de março em um
design concreto de descoberta do ECC 2.0.

O objetivo não é apenas "menos arquivos copiados durante a instalação." O alvo real é
um sistema de instalação que possa responder, deterministicamente:

- o que foi solicitado
- o que foi resolvido
- o que foi copiado ou gerado
- quais transformações específicas do target foram aplicadas
- o que o ECC possui e pode remover ou reparar com segurança posteriormente

Esse é o contrato ausente entre a instalação do ECC 1.x e um plano de controle
do ECC 2.0.

## Base Implementada Atual

O primeiro substrato de instalação seletiva já existe no repositório:

- `manifests/install-modules.json`
- `manifests/install-profiles.json`
- `schemas/install-modules.schema.json`
- `schemas/install-profiles.schema.json`
- `schemas/install-state.schema.json`
- `scripts/ci/validate-install-manifests.js`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install/request.js`
- `scripts/lib/install/runtime.js`
- `scripts/lib/install/apply.js`
- `scripts/lib/install-targets/`
- `scripts/lib/install-state.js`
- `scripts/lib/install-executor.js`
- `scripts/lib/install-lifecycle.js`
- `scripts/ecc.js`
- `scripts/install-apply.js`
- `scripts/install-plan.js`
- `scripts/list-installed.js`
- `scripts/doctor.js`

Capacidades atuais:

- catálogos de módulos e perfis legíveis por máquina
- validação de CI que entradas de manifesto apontam para caminhos reais no repositório
- expansão de dependências e filtragem por target
- planejamento de operações com consciência de adapter
- normalização canônica de requisições para modos de instalação legado e por manifesto
- despacho de runtime explícito de requisições normalizadas para criação de planos
- instalações legado e por manifesto ambas gravam estado de instalação durável
- inspeção somente leitura de planos de instalação antes de qualquer mutação
- roteamento de CLI unificado `ecc` para comandos de instalação, planejamento e ciclo de vida
- inspeção e mutação de ciclo de vida via `list-installed`, `doctor`, `repair`
  e `uninstall`

Limitação atual:

- semânticas de merge/remove específicas do target ainda estão em nível de scaffold para alguns módulos
- compatibilidade legada de `ecc-install` ainda aponta para `install.sh`
- superfície de publicação ainda é ampla em `package.json`

## Revisão do Código Atual

A pilha atual do instalador já é muito mais saudável do que o instalador shell original
de linguagem em primeiro lugar, mas ainda concentra muita responsabilidade em
alguns arquivos.

### Caminho de Runtime Atual

O fluxo de runtime hoje é:

1. `install.sh`
   wrapper shell fino que resolve a raiz real do pacote
2. `scripts/install-apply.js`
   CLI do instalador voltado ao usuário para modos legado e por manifesto
3. `scripts/lib/install/request.js`
   análise de CLI mais normalização canônica de requisição
4. `scripts/lib/install/runtime.js`
   despacho de runtime de requisições normalizadas para planos de instalação
5. `scripts/lib/install-executor.js`
   tradução de argumentos, compatibilidade legada, materialização de operações,
   mutação do sistema de arquivos e gravação de estado de instalação
6. `scripts/lib/install-manifests.js`
   carregamento de catálogo de módulo/perfil mais expansão de dependências
7. `scripts/lib/install-targets/`
   scaffold de raiz do target e caminho de destino
8. `scripts/lib/install-state.js`
   leitura/gravação de estado de instalação com suporte a schema
9. `scripts/lib/install-lifecycle.js`
   comportamento de doctor/repair/uninstall derivado de operações armazenadas

Isso é suficiente para provar o substrato de instalação seletiva, mas não o suficiente para
deixar a arquitetura do instalador se sentir estável.

### Pontos Fortes Atuais

- a intenção de instalação agora é explícita através de `--profile` e `--modules`
- análise de requisição e normalização de requisição agora estão separadas do shell de CLI
- resolução de raiz do target já foi adapterizada
- comandos de ciclo de vida agora usam estado de instalação durável em vez de adivinhar
- o repositório já tem um ponto de entrada Node unificado através de `ecc` e
  `install-apply.js`

### Acoplamento Atual Ainda Presente

1. `install-executor.js` é menor do que antes, mas ainda carrega muitas camadas de
   planejamento e materialização ao mesmo tempo.
   O limite de requisição agora está extraído, mas tradução de requisição legada,
   expansão de plano por manifesto e materialização de operação ainda vivem juntos.
2. os adapters de target ainda são muito finos.
   Hoje eles principalmente resolvem raízes e fazem scaffold de caminhos de destino. As semânticas
   reais de instalação ainda vivem em branches do executor e heurísticas de caminho.
3. o limite planner/executor não está limpo o suficiente ainda.
   `install-manifests.js` resolve módulos, mas o conjunto final de operações de instalação
   ainda é parcialmente construído em lógica específica do executor.
4. o comportamento de ciclo de vida depende de operações registradas de baixo nível mais do que de
   semânticas de módulo estáveis.
   Isso funciona para cópia simples de arquivos, mas torna-se frágil para comportamentos
   merge/generate/remove.
5. o modo de compatibilidade está misturado diretamente no runtime principal do instalador.
   Instalações de linguagem legadas devem se comportar como um adapter de requisição, não como uma
   arquitetura de instalador paralela.

## Mudanças Arquiteturais Modulares Propostas

O próximo passo arquitetural é separar o instalador em camadas explícitas,
com cada camada retornando dados estáveis em vez de imediatamente mutar arquivos.

### Estado Alvo

O pipeline de instalação desejado é:

1. superfície de CLI
2. normalização de requisição
3. resolução de módulo
4. planejamento de target
5. planejamento de operação
6. execução
7. persistência de estado de instalação
8. serviços de ciclo de vida construídos no mesmo contrato de operação

A ideia principal é simples:

- manifestos descrevem conteúdo
- adapters descrevem semânticas de pouso específicas do target
- planners descrevem o que deve acontecer
- executores aplicam esses planos
- comandos de ciclo de vida reutilizam o mesmo modelo plano/estado em vez de reinventá-lo

### Camadas de Runtime Propostas

#### 1. Superfície de CLI

Responsabilidade:

- analisar apenas a intenção do usuário
- rotear para install, plan, doctor, repair, uninstall
- renderizar saída humana ou JSON

Não deve possuir:

- tradução de linguagem legada
- regras de instalação específicas do target
- construção de operação

Arquivos sugeridos:

```text
scripts/ecc.js
scripts/install-apply.js
scripts/install-plan.js
scripts/doctor.js
scripts/repair.js
scripts/uninstall.js
```

Estes permanecem como pontos de entrada, mas tornam-se wrappers finos em torno de módulos de biblioteca.

#### 2. Normalizador de Requisição

Responsabilidade:

- traduzir flags brutas de CLI em uma requisição de instalação canônica
- converter instalações de linguagem legadas em uma forma de requisição de compatibilidade
- rejeitar entradas mistas ou ambíguas cedo

Requisição canônica sugerida:

```json
{
  "mode": "manifest",
  "target": "cursor",
  "profile": "developer",
  "modules": [],
  "legacyLanguages": [],
  "dryRun": false
}
```

ou, no modo de compatibilidade:

```json
{
  "mode": "legacy-compat",
  "target": "claude",
  "profile": null,
  "modules": [],
  "legacyLanguages": ["typescript", "python"],
  "dryRun": false
}
```

Isso permite que o restante do pipeline ignore se a requisição veio da sintaxe de CLI antiga ou
nova.

#### 3. Resolvedor de Módulo

Responsabilidade:

- carregar catálogos de manifesto
- expandir dependências
- rejeitar conflitos
- filtrar módulos não suportados por target
- retornar um objeto de resolução canônico

Esta camada deve permanecer pura e somente leitura.

Não deve conhecer:

- caminhos do sistema de arquivos de destino
- semânticas de merge
- estratégias de cópia

Arquivo mais próximo atual:

- `scripts/lib/install-manifests.js`

Divisão sugerida:

```text
scripts/lib/install/catalog.js
scripts/lib/install/resolve-request.js
scripts/lib/install/resolve-modules.js
```

#### 4. Planner de Target

Responsabilidade:

- selecionar o adapter de target de instalação
- resolver raiz do target
- resolver caminho de estado de instalação
- expandir regras de mapeamento módulo-para-target
- emitir intenções de operação com consciência do target

É aqui que o significado específico do target deve residir.

Exemplos:

- Claude pode preservar hierarquia nativa em `~/.claude`
- Cursor pode sincronizar filhos raiz `.cursor` empacotados de forma diferente das regras
- configurações geradas podem exigir semânticas de merge ou substituição dependendo do target

Arquivos mais próximos atuais:

- `scripts/lib/install-targets/helpers.js`
- `scripts/lib/install-targets/registry.js`

Evolução sugerida:

```text
scripts/lib/install/targets/registry.js
scripts/lib/install/targets/claude-home.js
scripts/lib/install/targets/cursor-project.js
scripts/lib/install/targets/antigravity-project.js
```

Cada adapter deve eventualmente expor mais do que `resolveRoot`.
Deve possuir mapeamento de caminho e estratégia para sua família de target.

#### 5. Planner de Operação

Responsabilidade:

- transformar resolução de módulo mais regras de adapter em um grafo de operação tipado
- emitir operações de primeira classe como:
  - `copy-file`
  - `copy-tree`
  - `merge-json`
  - `render-template`
  - `remove`
- anexar metadados de propriedade e validação

Esta é a costura arquitetural ausente no instalador atual.

Hoje, as operações são parcialmente em nível de scaffold e parcialmente específicas do executor.
O ECC 2.0 deve tornar o planejamento de operação uma fase independente para que:

- `plan` torne-se uma verdadeira visualização da execução
- `doctor` possa validar o comportamento pretendido, não apenas os arquivos atuais
- `repair` possa reconstruir o trabalho ausente exato com segurança
- `uninstall` possa reverter apenas operações gerenciadas

#### 6. Motor de Execução

Responsabilidade:

- aplicar um grafo de operação tipado
- aplicar regras de sobrescrita e propriedade
- preparar gravações com segurança
- coletar resultados de operação aplicada final

Esta camada não deve decidir *o que* fazer.
Deve decidir apenas *como* aplicar um tipo de operação fornecido com segurança.

Arquivo mais próximo atual:

- `scripts/lib/install-executor.js`

Refatoração recomendada:

```text
scripts/lib/install/executor/apply-plan.js
scripts/lib/install/executor/apply-copy.js
scripts/lib/install/executor/apply-merge-json.js
scripts/lib/install/executor/apply-remove.js
```

Isso transforma a lógica do executor de um grande runtime de ramificação em um conjunto de pequenos
manipuladores de operação.

#### 7. Armazenamento de Estado de Instalação

Responsabilidade:

- validar e persistir o estado de instalação
- registrar requisição canônica, resolução e operações aplicadas
- suportar comandos de ciclo de vida sem forçá-los a fazer engenharia reversa das instalações

Arquivo mais próximo atual:

- `scripts/lib/install-state.js`

Esta camada já está próxima da forma correta. A principal mudança remanescente é
armazenar metadados de operação mais ricos assim que as semânticas de merge/generate forem reais.

#### 8. Serviços de Ciclo de Vida

Responsabilidade:

- `list-installed`: inspecionar apenas o estado
- `doctor`: comparar a visão desejada/estado de instalação com o sistema de arquivos atual
- `repair`: regenerar um plano a partir do estado e reaplicar operações seguras
- `uninstall`: remover apenas saídas de propriedade do ECC

Arquivo mais próximo atual:

- `scripts/lib/install-lifecycle.js`

Esta camada deve eventualmente operar em tipos de operação e políticas de propriedade,
não apenas em registros brutos de `copy-file`.

## Layout de Arquivo Proposto

O estado final modular limpo deve parecer aproximadamente assim:

```text
scripts/lib/install/
  catalog.js
  request.js
  resolve-modules.js
  plan-operations.js
  state-store.js
  targets/
    registry.js
    claude-home.js
    cursor-project.js
    antigravity-project.js
    codex-home.js
    opencode-home.js
  executor/
    apply-plan.js
    apply-copy.js
    apply-merge-json.js
    apply-render-template.js
    apply-remove.js
  lifecycle/
    discover.js
    doctor.js
    repair.js
    uninstall.js
```

Esta não é uma divisão de empacotamento.
É uma divisão de propriedade de código dentro do repositório atual para que cada camada tenha uma função.

## Mapa de Migração dos Arquivos Atuais

O caminho de migração de menor risco é evolutivo, não uma reescrita.

### Manter

- `install.sh` como o shim de compatibilidade público
- `scripts/ecc.js` como a CLI unificada
- `scripts/lib/install-state.js` como ponto de partida para o armazenamento de estado
- IDs de adapter de target atuais e localizações de estado

### Extrair

- análise de requisição e tradução de compatibilidade de
  `scripts/lib/install-executor.js`
- planejamento de operação com consciência do target de branches do executor para adapters de target
  mais módulos planner
- análise específica do ciclo de vida do monólito de ciclo de vida compartilhado para serviços menores

### Substituir Gradualmente

- heurísticas amplas de cópia de caminho com operações tipadas
- planejamento de adapter apenas scaffold com semânticas de propriedade do adapter
- branches de instalação de linguagem legada com tradução de requisição legada para o mesmo
  pipeline planner/executor

## Mudanças Arquiteturais Imediatas a Fazer a Seguir

Se o objetivo é ECC 2.0 e não apenas "funcionando o suficiente," os próximos passos de
modularização devem ser:

1. dividir `install-executor.js` em módulos de normalização de requisição, planejamento de operação
   e execução
2. mover decisões de estratégia específicas do target para métodos de planejamento de propriedade do adapter
3. fazer `repair` e `uninstall` operarem em manipuladores de operação tipados em vez de
   apenas em registros simples de `copy-file`
4. ensinar manifestos sobre estratégia de instalação e propriedade para que o planner não
   dependa mais de heurísticas de caminho
5. reduzir a superfície de publicação npm apenas após os limites internos do módulo estarem
   estáveis

## Por que o Modelo Atual Não É Suficiente

Hoje o ECC ainda se comporta como um copiador amplo de payload:

- `install.sh` é de linguagem em primeiro lugar e pesado em branches de target
- os targets são parcialmente implícitos no layout de diretório
- desinstalação, reparação e doctor agora existem mas ainda são comandos de ciclo de vida iniciais
- o repositório não pode provar o que uma instalação anterior realmente escreveu
- a superfície de publicação ainda é ampla em `package.json`

Isso cria os problemas já apontados no mega plano:

- usuários puxam mais conteúdo do que seu harness ou fluxo de trabalho precisa
- suporte e atualizações são mais difíceis porque as instalações não são registradas
- o comportamento do target deriva porque a lógica de instalação é duplicada em branches shell
- targets futuros como Codex ou OpenCode requerem mais lógica de caso especial em vez de
  reutilizar um contrato de instalação estável

## Tese de Design do ECC 2.0

A instalação seletiva deve ser modelada como:

1. resolver intenção solicitada em um grafo de módulos canônico
2. traduzir esse grafo através de um adapter de target
3. executar um conjunto de operações de instalação determinístico
4. gravar estado de instalação como a fonte de verdade durável

Isso significa que o ECC 2.0 precisa de dois contratos, não de um:

- um contrato de conteúdo
  quais módulos existem e como dependem uns dos outros
- um contrato de target
  como esses módulos pousam dentro de Claude, Cursor, Antigravity, Codex ou OpenCode

O repositório atual tinha apenas a primeira metade em forma inicial.
O repositório atual agora tem o primeiro slice vertical completo, mas não a
semântica completa específica do target.

## Restrições de Design

1. Manter `everything-claude-code` como o repositório de origem canônico.
2. Preservar os fluxos de `install.sh` existentes durante a migração.
3. Suportar targets com escopo de home e com escopo de projeto a partir do mesmo planner.
4. Tornar desinstalação/reparação/doctor possíveis sem adivinhação.
5. Evitar que a lógica de cópia por target vaze de volta para as definições de módulo.
6. Manter o suporte futuro a Codex e OpenCode aditivo, não uma reescrita.

## Artefatos Canônicos

### 1. Catálogo de Módulos

O catálogo de módulos é o grafo de conteúdo canônico.

Campos atuais já implementados:

- `id`
- `kind`
- `description`
- `paths`
- `targets`
- `dependencies`
- `defaultInstall`
- `cost`
- `stability`

Campos ainda necessários para o ECC 2.0:

- `installStrategy`
  por exemplo `copy`, `flatten-rules`, `generate`, `merge-config`
- `ownership`
  se o ECC possui totalmente o caminho de destino ou apenas os arquivos gerados sob ele
- `pathMode`
  por exemplo `preserve`, `flatten`, `target-template`
- `conflicts`
  módulos ou famílias de caminho que não podem coexistir em um target
- `publish`
  se o módulo é empacotado por padrão, opcional ou gerado pós-instalação

Forma futura sugerida:

```json
{
  "id": "hooks-runtime",
  "kind": "hooks",
  "paths": ["hooks", "scripts/hooks"],
  "targets": ["claude", "cursor", "opencode"],
  "dependencies": [],
  "installStrategy": "copy",
  "pathMode": "preserve",
  "ownership": "managed",
  "defaultInstall": true,
  "cost": "medium",
  "stability": "stable"
}
```

### 2. Catálogo de Perfis

Os perfis permanecem finos.

Devem expressar a intenção do usuário, não duplicar a lógica do target.

Exemplos atuais já implementados:

- `core`
- `developer`
- `security`
- `research`
- `full`

Campos ainda necessários:

- `defaultTargets`
- `recommendedFor`
- `excludes`
- `requiresConfirmation`

Isso permite que o ECC 2.0 diga coisas como:

- `developer` é o padrão recomendado para Claude e Cursor
- `research` pode ser pesado para instalações locais estreitas
- `full` é permitido mas não é padrão

### 3. Adapters de Target

Esta é a principal camada ausente.

O grafo de módulos não deve saber:

- onde o home do Claude fica
- como o Cursor achata ou remapeia conteúdo
- quais arquivos de configuração precisam de semânticas de merge em vez de cópia cega

Isso pertence a um adapter de target.

Interface sugerida:

```ts
type InstallTargetAdapter = {
  id: string;
  kind: "home" | "project";
  supports(target: string): boolean;
  resolveRoot(input?: string): Promise<string>;
  planOperations(input: InstallOperationInput): Promise<InstallOperation[]>;
  validate?(input: InstallOperationInput): Promise<ValidationIssue[]>;
};
```

Primeiros adapters sugeridos:

1. `claude-home`
   escreve em `~/.claude/...`
2. `cursor-project`
   escreve em `./.cursor/...`
3. `antigravity-project`
   escreve em `./.agent/...`
4. `codex-home`
   posteriormente
5. `opencode-home`
   posteriormente

Isso corresponde ao mesmo padrão já proposto no documento de descoberta do adapter de sessão: contrato canônico primeiro, adapter específico do harness depois.

## Modelo de Planejamento de Instalação

O CLI atual `scripts/install-plan.js` prova que o repositório pode resolver módulos
solicitados em um conjunto de módulos filtrado.

O ECC 2.0 precisa da próxima camada: planejamento de operação.

Fases sugeridas:

1. normalização de entrada
   - analisar `--target`
   - analisar `--profile`
   - analisar `--modules`
   - opcionalmente traduzir argumentos de linguagem legada
2. resolução de módulo
   - expandir dependências
   - rejeitar conflitos
   - filtrar por targets suportados
3. planejamento de adapter
   - resolver raiz do target
   - derivar operações exatas de cópia ou geração
   - identificar merges de configuração e remapamentos de target
4. saída de dry-run
   - mostrar módulos selecionados
   - mostrar módulos ignorados
   - mostrar operações de arquivo exatas
5. mutação
   - executar o plano de operação
6. gravação de estado
   - persistir estado de instalação somente após conclusão bem-sucedida

Forma de operação sugerida:

```json
{
  "kind": "copy",
  "moduleId": "rules-core",
  "source": "rules/common/coding-style.md",
  "destination": "/Users/example/.claude/rules/ecc/common/coding-style.md",
  "ownership": "managed",
  "overwritePolicy": "replace"
}
```

Outros tipos de operação:

- `copy`
- `copy-tree`
- `flatten-copy`
- `render-template`
- `merge-json`
- `merge-jsonc`
- `mkdir`
- `remove`

## Contrato de Estado de Instalação

O estado de instalação é o contrato durável que o ECC 1.x não tem.

Convenções de caminho sugeridas:

- Target Claude:
  `~/.claude/ecc/install-state.json`
- Target Cursor:
  `./.cursor/ecc-install-state.json`
- Target Antigravity:
  `./.agent/ecc-install-state.json`
- futuro target Codex:
  `~/.codex/ecc-install-state.json`

Payload sugerido:

```json
{
  "schemaVersion": "ecc.install.v1",
  "installedAt": "2026-03-13T00:00:00Z",
  "lastValidatedAt": "2026-03-13T00:00:00Z",
  "target": {
    "id": "claude-home",
    "root": "/Users/example/.claude"
  },
  "request": {
    "profile": "developer",
    "modules": ["orchestration"],
    "legacyLanguages": ["typescript", "python"]
  },
  "resolution": {
    "selectedModules": [
      "rules-core",
      "agents-core",
      "commands-core",
      "hooks-runtime",
      "platform-configs",
      "workflow-quality",
      "framework-language",
      "database",
      "orchestration"
    ],
    "skippedModules": []
  },
  "source": {
    "repoVersion": "2.0.0",
    "repoCommit": "git-sha",
    "manifestVersion": 1
  },
  "operations": [
    {
      "kind": "copy",
      "moduleId": "rules-core",
      "destination": "/Users/example/.claude/rules/ecc/common/coding-style.md",
      "digest": "sha256:..."
    }
  ]
}
```

Requisitos de estado:

- detalhes suficientes para que a desinstalação remova apenas saídas gerenciadas pelo ECC
- detalhes suficientes para que a reparação compare arquivos instalados desejados versus reais
- detalhes suficientes para que o doctor explique a deriva em vez de adivinhar

## Comandos de Ciclo de Vida

Os seguintes comandos são a superfície de ciclo de vida para o estado de instalação:

1. `ecc list-installed`
2. `ecc uninstall`
3. `ecc doctor`
4. `ecc repair`

Status de implementação atual:

- `ecc list-installed` roteia para `node scripts/list-installed.js`
- `ecc uninstall` roteia para `node scripts/uninstall.js`
- `ecc doctor` roteia para `node scripts/doctor.js`
- `ecc repair` roteia para `node scripts/repair.js`
- pontos de entrada de script legados permanecem disponíveis durante a migração

### `list-installed`

Responsabilidades:

- mostrar id e raiz do target
- mostrar perfil/módulos solicitados
- mostrar módulos resolvidos
- mostrar versão da origem e horário de instalação

### `uninstall`

Responsabilidades:

- carregar estado de instalação
- remover apenas destinos gerenciados pelo ECC registrados no estado
- deixar arquivos não relacionados criados pelo usuário intactos
- excluir estado de instalação somente após limpeza bem-sucedida

### `doctor`

Responsabilidades:

- detectar arquivos gerenciados ausentes
- detectar deriva de configuração inesperada
- detectar raízes de target que não existem mais
- detectar incompatibilidade de manifesto/versão

### `repair`

Responsabilidades:

- reconstruir o plano de operação desejado a partir do estado de instalação
- recopiar arquivos gerenciados ausentes ou derivados
- recusar reparação se os módulos solicitados não existirem mais no manifesto atual
  a menos que exista um mapa de compatibilidade

## Camada de Compatibilidade Legada

O `install.sh` atual aceita:

- `--target <claude|cursor|antigravity>`
- uma lista de nomes de linguagem

Esse comportamento não pode desaparecer em um único corte porque os usuários já dependem dele.

O ECC 2.0 deve traduzir argumentos de linguagem legada em uma requisição de compatibilidade.

Abordagem sugerida:

1. manter a forma de CLI existente para o modo legado
2. mapear nomes de linguagem para requisições de módulo como:
   - `rules-core`
   - subconjuntos de regras compatíveis com o target
3. gravar estado de instalação mesmo para instalações legadas
4. rotular a requisição como `legacyMode: true`

Exemplo:

```json
{
  "request": {
    "legacyMode": true,
    "legacyLanguages": ["typescript", "python"]
  }
}
```

Isso mantém o comportamento antigo disponível enquanto move todas as instalações para o mesmo contrato
de estado.

## Limite de Publicação

O pacote npm atual ainda publica um payload amplo através de `package.json`.

O ECC 2.0 deve melhorar isso com cuidado.

Sequência recomendada:

1. manter um pacote npm canônico primeiro
2. usar manifestos para conduzir seleção em tempo de instalação antes de mudar a forma de publicação
3. apenas mais tarde considerar reduzir a superfície empacotada onde for seguro

Por quê:

- a instalação seletiva pode ser entregue antes de uma cirurgia agressiva de pacote
- desinstalação e reparação dependem mais do estado de instalação do que de mudanças de publicação
- o suporte a Codex/OpenCode é mais fácil se a origem do pacote permanecer unificada

Possíveis direções futuras:

- pacotes slim gerados por perfil
- tarballs específicos de target gerados
- busca remota opcional de módulos pesados

Esses são Fase 3 ou posterior, não pré-requisitos para instalações com consciência de perfil.

## Recomendação de Layout de Arquivo

Próximos arquivos sugeridos:

```text
scripts/lib/install-targets/
  claude-home.js
  cursor-project.js
  antigravity-project.js
  registry.js
scripts/lib/install-state.js
scripts/ecc.js
scripts/install-apply.js
scripts/list-installed.js
scripts/uninstall.js
scripts/doctor.js
scripts/repair.js
tests/lib/install-targets.test.js
tests/lib/install-state.test.js
tests/lib/install-lifecycle.test.js
```

`install.sh` pode permanecer como o ponto de entrada voltado ao usuário durante a migração, mas
deve tornar-se um shell fino em torno de um planner e executor baseados em Node em vez de
continuar crescendo branches shell por target.

## Sequência de Implementação

### Fase 1: Planner para Contrato

1. manter o schema de manifesto atual e o resolvedor
2. adicionar planejamento de operação em cima dos módulos resolvidos
3. definir o schema de estado `ecc.install.v1`
4. gravar estado de instalação em instalação bem-sucedida

### Fase 2: Adapters de Target

1. extrair comportamento de instalação do Claude para o adapter `claude-home`
2. extrair comportamento de instalação do Cursor para o adapter `cursor-project`
3. extrair comportamento de instalação do Antigravity para o adapter `antigravity-project`
4. reduzir `install.sh` para análise de argumentos mais invocação de adapter

### Fase 3: Ciclo de Vida

1. adicionar semânticas de merge/remove específicas do target mais fortes
2. estender cobertura de repair/uninstall para operações não-cópia
3. reduzir superfície de envio de pacote para o grafo de módulos em vez de pastas amplas
4. decidir quando `ecc-install` deve tornar-se um alias fino para `ecc install`

### Fase 4: Publicação e Targets Futuros

1. avaliar redução segura da superfície de publicação de `package.json`
2. adicionar `codex-home`
3. adicionar `opencode-home`
4. considerar pacotes de perfil gerados se a pressão de empacotamento permanecer alta

## Próximos Passos Imediatos no Repositório Local

Os próximos movimentos de implementação de maior sinal neste repositório são:

1. adicionar semânticas de merge/remove específicas do target para módulos do tipo configuração
2. estender repair e uninstall além de operações simples de copy-file
3. reduzir superfície de envio de pacote para o grafo de módulos em vez de pastas amplas
4. decidir se `ecc-install` permanece separado ou torna-se `ecc install`
5. adicionar testes que fixem:
   - comportamento de merge/remove específico do target
   - segurança de repair e uninstall para operações não-cópia
   - roteamento de CLI unificado `ecc` e garantias de compatibilidade

## Perguntas Abertas

1. As regras devem permanecer endereçáveis por linguagem no modo legado para sempre, ou apenas durante
   a janela de migração?
2. `platform-configs` deve sempre instalar com `core`, ou ser dividido em
   módulos menores específicos do target?
3. Queremos semânticas de merge de configuração registradas no nível de operação ou apenas em
   lógica de adapter?
4. As famílias de skill pesadas devem eventualmente mover para busca sob demanda em vez de
   inclusão em tempo de empacotamento?
5. Os adapters de target Codex e OpenCode devem ser entregues apenas após os comandos de ciclo de vida
   de Claude/Cursor estarem estáveis?

## Recomendação

Tratar o resolvedor de manifesto atual como adapter `0` para instalações:

1. preservar a superfície de instalação atual
2. mover o comportamento real de cópia para trás dos adapters de target
3. gravar estado de instalação para cada instalação bem-sucedida
4. fazer desinstalação, doctor e repair depender apenas do estado de instalação
5. apenas então reduzir empacotamento ou adicionar mais targets

Esse é o caminho mais curto do espalhamento do instalador do ECC 1.x para um contrato de instalação/controle
do ECC 2.0 que é determinístico, suportável e extensível.
