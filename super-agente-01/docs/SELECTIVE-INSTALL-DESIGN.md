# Design de Instalação Seletiva do ECC

## Objetivo

Este documento define o design de instalação seletiva voltado ao usuário para o ECC.

Ele complementa
`docs/SELECTIVE-INSTALL-ARCHITECTURE.md`, que foca na arquitetura de runtime interno
e nos limites de código.

Este documento responde primeiro às perguntas de produto e operador:

- como os usuários escolhem os componentes do ECC
- como a CLI deve se parecer
- qual arquivo de configuração deve existir
- como a instalação deve se comportar entre os targets de harness
- como o design mapeia para a base de código ECC atual sem exigir uma reescrita

## Problema

Hoje o ECC ainda parece um instalador de payload grande mesmo que o repositório agora
tenha suporte inicial de manifesto e ciclo de vida.

Os usuários precisam de um modelo mental mais simples:

- instalar a linha de base
- adicionar os pacotes de linguagem que realmente usam
- adicionar as configurações de framework que realmente querem
- adicionar pacotes de capacidade opcionais como segurança, pesquisa ou orquestração

O sistema de instalação seletiva deve fazer o ECC parecer combinável em vez de
tudo-ou-nada.

No substrato atual, os componentes voltados ao usuário ainda são uma camada de alias sobre
módulos de instalação internos mais grossos. Isso significa que include/exclude já é útil
no nível de seleção de módulo, mas alguns limites de nível de arquivo permanecem imperfeitos
até que o grafo de módulos subjacente seja dividido de forma mais refinada.

## Objetivos

1. Permitir que os usuários instalem um pequeno footprint padrão do ECC rapidamente.
2. Permitir que os usuários componham instalações a partir de famílias de componentes reutilizáveis:
   - regras essenciais
   - pacotes de linguagem
   - pacotes de framework
   - pacotes de capacidade
   - configurações de target/plataforma
3. Manter uma UX consistente entre Claude, Cursor, Antigravity, Codex e
   OpenCode.
4. Manter as instalações inspecionáveis, reparáveis e desinstalaváveis.
5. Preservar a compatibilidade retroativa com o estilo atual `ecc-install typescript`
   durante o rollout.

## Não-Objetivos

- empacotar o ECC em múltiplos pacotes npm na primeira fase
- construir um marketplace remoto
- UI de plano de controle completo na mesma fase
- resolver todo problema de classificação de skill antes da instalação seletiva ser entregue

## Princípios de Experiência do Usuário

### 1. Começar Pequeno

Um usuário deve ser capaz de obter uma instalação útil do ECC com um comando:

```bash
ecc install --target claude --profile core
```

A experiência padrão não deve assumir que o usuário quer todas as famílias de skill e
todos os frameworks.

### 2. Expandir por Intenção

O usuário deve pensar em termos de:

- "Quero a linha de base do desenvolvedor"
- "Preciso de TypeScript e Python"
- "Quero Next.js e Django"
- "Quero o pacote de segurança"

O usuário não deve ter que conhecer os caminhos internos brutos do repositório.

### 3. Visualizar Antes de Mutar

Todo caminho de instalação deve suportar planejamento de dry-run:

```bash
ecc install --target cursor --profile developer --with lang:typescript --with framework:nextjs --dry-run
```

O plano deve mostrar claramente:

- componentes selecionados
- componentes ignorados
- raiz do target
- caminhos gerenciados
- localização esperada do estado de instalação

### 4. Configuração Local Deve Ser de Primeira Classe

As equipes devem ser capazes de commitar uma configuração de instalação em nível de projeto e usar:

```bash
ecc install --config ecc-install.json
```

Isso permite instalações determinísticas entre colaboradores e CI.

## Modelo de Componentes

O manifesto atual já usa módulos e perfis de instalação. O design voltado ao usuário
deve manter essa estrutura interna, mas apresentá-la como quatro famílias principais
de componentes.

Nota de implementação de curto prazo: alguns IDs de componentes voltados ao usuário ainda resolvem para
módulos internos compartilhados, especialmente na camada de linguagem/framework. O
catálogo melhora a UX imediatamente enquanto preserva um caminho limpo para maior
granularidade de módulo em fases posteriores.

### 1. Linha de Base

Estes são os blocos de construção padrão do ECC:

- regras essenciais
- agents de linha de base
- comandos essenciais
- hooks de runtime
- configurações de plataforma
- primitivas de qualidade de fluxo de trabalho

Exemplos de módulos internos atuais:

- `rules-core`
- `agents-core`
- `commands-core`
- `hooks-runtime`
- `platform-configs`
- `workflow-quality`

### 2. Pacotes de Linguagem

Os pacotes de linguagem agrupam regras, orientações e fluxos de trabalho para um ecossistema de linguagem.

Exemplos:

- `lang:typescript`
- `lang:python`
- `lang:go`
- `lang:java`
- `lang:rust`

Cada pacote de linguagem deve resolver para um ou mais módulos internos mais
ativos específicos do target.

### 3. Pacotes de Framework

Os pacotes de framework ficam acima dos pacotes de linguagem e incluem regras específicas de framework,
skills e configuração opcional.

Exemplos:

- `framework:react`
- `framework:nextjs`
- `framework:django`
- `framework:springboot`
- `framework:laravel`

Os pacotes de framework devem depender do pacote de linguagem correto ou de primitivas de linha de base
onde apropriado.

### 4. Pacotes de Capacidade

Os pacotes de capacidade são pacotes de funcionalidade ECC transversais.

Exemplos:

- `capability:security`
- `capability:research`
- `capability:orchestration`
- `capability:media`
- `capability:content`

Estes devem mapear para as famílias de módulos atuais já sendo introduzidas nos
manifestos.

## Perfis

Os perfis permanecem a entrada mais rápida.

Perfis recomendados voltados ao usuário:

- `core`
  linha de base mínima, padrão seguro para a maioria dos usuários experimentando o ECC
- `developer`
  melhor padrão para trabalho ativo de engenharia de software
- `security`
  linha de base mais orientações pesadas de segurança
- `research`
  linha de base mais ferramentas de pesquisa/conteúdo/investigação
- `full`
  tudo classificado e atualmente suportado

Os perfis devem ser combináveis com flags adicionais `--with` e `--without`.

Exemplo:

```bash
ecc install --target claude --profile developer --with lang:typescript --with framework:nextjs --without capability:orchestration
```

## Design de CLI Proposto

### Comandos Primários

```bash
ecc install
ecc plan
ecc list-installed
ecc doctor
ecc repair
ecc uninstall
ecc catalog
```

### CLI de Install

Forma recomendada:

```bash
ecc install [--target <target>] [--profile <name>] [--with <component>]... [--without <component>]... [--config <path>] [--dry-run] [--json]
```

Exemplos:

```bash
ecc install --target claude --profile core
ecc install --target cursor --profile developer --with lang:typescript --with framework:nextjs
ecc install --target antigravity --with capability:security --with lang:python
ecc install --config ecc-install.json
```

### CLI de Plan

Forma recomendada:

```bash
ecc plan [same selection flags as install]
```

Objetivo:

- produzir uma visualização sem mutação
- atuar como a superfície canônica de depuração para instalação seletiva

### CLI de Catalog

Forma recomendada:

```bash
ecc catalog profiles
ecc catalog components
ecc catalog components --family language
ecc catalog show framework:nextjs
```

Objetivo:

- permitir que os usuários descubram nomes de componentes válidos sem ler documentação
- manter a autoria de configuração acessível

### CLI de Compatibilidade

Esses fluxos legados ainda devem funcionar durante a migração:

```bash
ecc-install typescript
ecc-install --target cursor typescript
ecc typescript
```

Internamente, estes devem normalizar para o novo modelo de requisição e gravar
estado de instalação da mesma forma que instalações modernas.

## Arquivo de Configuração Proposto

### Nome do Arquivo

Padrão recomendado:

- `ecc-install.json`

Suporte futuro opcional:

- `.ecc/install.json`

### Forma de Configuração

```json
{
  "$schema": "./schemas/ecc-install-config.schema.json",
  "version": 1,
  "target": "cursor",
  "profile": "developer",
  "include": [
    "lang:typescript",
    "lang:python",
    "framework:nextjs",
    "capability:security"
  ],
  "exclude": [
    "capability:media"
  ],
  "options": {
    "hooksProfile": "standard",
    "mcpCatalog": "baseline",
    "includeExamples": false
  }
}
```

### Semânticas de Campo

- `target`
  target de harness selecionado como `claude`, `cursor` ou `antigravity`
- `profile`
  perfil de linha de base para começar
- `include`
  componentes adicionais a adicionar
- `exclude`
  componentes a subtrair do resultado do perfil
- `options`
  flags de ajuste de target/runtime que não mudam a identidade do componente

### Regras de Precedência

1. Argumentos de CLI substituem valores do arquivo de configuração.
2. O arquivo de configuração substitui os padrões do perfil.
3. Os padrões do perfil substituem os padrões internos do módulo.

Isso mantém o comportamento previsível e fácil de explicar.

## Fluxo de Instalação Modular

O fluxo voltado ao usuário deve ser:

1. carregar o arquivo de configuração se fornecido ou detectado automaticamente
2. mesclar intenção de CLI sobre intenção de configuração
3. normalizar a requisição em uma seleção canônica
4. expandir perfil em componentes de linha de base
5. adicionar componentes `include`
6. subtrair componentes `exclude`
7. resolver dependências e compatibilidade de target
8. renderizar um plano
9. aplicar operações se não estiver no modo dry-run
10. gravar estado de instalação

A propriedade de UX importante é que exatamente o mesmo fluxo alimenta:

- `install`
- `plan`
- `repair`
- `uninstall`

Os comandos diferem em ação, não em como o ECC entende a instalação selecionada.

## Comportamento do Target

A instalação seletiva deve preservar o mesmo grafo conceitual de componentes entre todos os
targets, enquanto deixa os adapters de target decidirem como o conteúdo pousa.

### Claude

Melhor adequado para:

- linha de base ECC com escopo de home
- comandos, agents, regras, hooks, configuração de plataforma, orquestração

### Cursor

Melhor adequado para:

- instalações com escopo de projeto
- regras mais automação e configuração locais do projeto

### Antigravity

Melhor adequado para:

- instalações de agent/regra/fluxo de trabalho com escopo de projeto

### Codex / OpenCode

Devem permanecer como targets aditivos em vez de forks especiais do instalador.

O design de instalação seletiva deve tornar estes apenas novos adapters mais novas
regras de mapeamento específicas do target, não novas arquiteturas de instalador.

## Viabilidade Técnica

Este design é viável porque o repositório já tem:

- manifestos de módulo e perfil de instalação
- adapters de target com caminhos de estado de instalação
- inspeção de plano
- registro de estado de instalação
- comandos de ciclo de vida
- uma superfície de CLI `ecc` unificada

O trabalho ausente não é invenção conceitual. O trabalho ausente é produtizar
o substrato atual em um modelo de componentes mais limpo voltado ao usuário.

### Viável na Fase 1

- seleção de perfil + include/exclude
- análise do arquivo de configuração `ecc-install.json`
- comando de catalog/descoberta
- mapeamento de alias de IDs de componente voltados ao usuário para conjuntos de módulos internos
- planejamento de dry-run e JSON

### Viável na Fase 2

- semânticas de adapter de target mais ricas
- operações com consciência de merge para ativos do tipo configuração
- comportamento de repair/uninstall mais forte para operações não-cópia

### Posteriormente

- superfície de publicação reduzida
- pacotes slim gerados
- busca remota de componente

## Mapeamento para os Manifestos ECC Atuais

Os manifestos atuais ainda não expõem uma verdadeira taxonomia `lang:*` /
`framework:*` / `capability:*` voltada ao usuário. Isso deve ser introduzido como uma
camada de apresentação sobre os módulos existentes, não como um segundo motor de instalador.

Abordagem recomendada:

- manter `install-modules.json` como o catálogo de resolução interno
- adicionar um catálogo de componentes voltado ao usuário que mapeia IDs de componente amigáveis para um ou
  mais módulos internos
- permitir que os perfis referenciem módulos internos ou IDs de componentes voltados ao usuário
  durante a janela de migração

Isso evita quebrar o substrato atual de instalação seletiva enquanto melhora a UX.

## Rollout Sugerido

### Fase 1: Design e Descoberta

- finalizar a taxonomia de componentes voltada ao usuário
- adicionar o schema de configuração
- adicionar design de CLI e regras de precedência

### Fase 2: Camada de Resolução Voltada ao Usuário

- implementar aliases de componente
- implementar análise de arquivo de configuração
- implementar `include` / `exclude`
- implementar `catalog`

### Fase 3: Semânticas de Target Mais Fortes

- mover mais lógica para planejamento de propriedade do target
- suportar operações merge/generate de forma limpa
- melhorar fidelidade de repair/uninstall

### Fase 4: Otimização de Empacotamento

- reduzir superfície publicada
- avaliar pacotes gerados

## Recomendação

O próximo movimento de implementação não deve ser "reescrever o instalador."

Deve ser:

1. manter o substrato atual de manifesto/runtime
2. adicionar um catálogo de componentes voltado ao usuário e arquivo de configuração
3. adicionar seleção de `include` / `exclude` e descoberta de catalog
4. deixar a pilha existente de planner e ciclo de vida consumir esse modelo

Esse é o caminho mais curto da base de código ECC atual para uma experiência real de instalação
seletiva que parece ECC 2.0 em vez de um grande instalador legado.
