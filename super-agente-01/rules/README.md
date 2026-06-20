# Regras
## Estrutura

As regras são organizadas em uma camada **common** mais diretórios **específicos por linguagem**:

```
rules/
├── common/          # Princípios independentes de linguagem (sempre instalar)
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   └── security.md
├── typescript/      # Específico de TypeScript/JavaScript
├── angular/         # Específico de Angular
├── vue/             # Específico de Vue 3
├── nuxt/            # Específico de Nuxt 4
├── python/          # Específico de Python
├── golang/          # Específico de Go
├── web/             # Específico de Web e frontend
├── swift/           # Específico de Swift
├── php/             # Específico de PHP
├── ruby/            # Específico de Ruby / Rails
└── arkts/           # Específico de HarmonyOS / ArkTS
```

- **common/** contém princípios universais — sem exemplos de código específicos de linguagem.
- **Diretórios de linguagem** estendem as regras common com padrões, ferramentas e exemplos de código específicos de framework. Cada arquivo referencia seu equivalente em common.

## Instalação

### Opção 1: Script de Instalação (Recomendado)

```bash
# Instalar common + um ou mais conjuntos de regras específicos de linguagem
./install.sh typescript
./install.sh angular
./install.sh vue
./install.sh nuxt
./install.sh python
./install.sh golang
./install.sh web
./install.sh swift
./install.sh php
./install.sh ruby
./install.sh arkts

# Instalar várias linguagens de uma vez
./install.sh typescript python
```

### Opção 2: Instalação Manual

> **Importante:** Copie diretórios inteiros — NÃO achate com `/*`.
> Os diretórios common e específicos de linguagem contêm arquivos com os mesmos nomes.
> Achatá-los em um único diretório faz com que os arquivos específicos de linguagem
> sobrescrevam as regras common, e quebra as referências relativas `../common/` usadas pelos
> arquivos específicos de linguagem.
>
> Use o namespace de propriedade do ECC abaixo para instalações do Claude em nível de usuário. Destinos
> achatados em nível de pacote podem colidir com pacotes de regras alheios ao ECC e não
> correspondem à orientação do README principal.

```bash
# Crie o namespace de regras do ECC uma única vez.
mkdir -p ~/.claude/rules/ecc

# Instale as regras common (obrigatórias para todos os projetos)
cp -r rules/common ~/.claude/rules/ecc/

# Instale as regras específicas de linguagem com base no tech stack do seu projeto
cp -r rules/typescript ~/.claude/rules/ecc/
cp -r rules/angular ~/.claude/rules/ecc/
cp -r rules/vue ~/.claude/rules/ecc/
cp -r rules/nuxt ~/.claude/rules/ecc/
cp -r rules/python ~/.claude/rules/ecc/
cp -r rules/golang ~/.claude/rules/ecc/
cp -r rules/web ~/.claude/rules/ecc/
cp -r rules/swift ~/.claude/rules/ecc/
cp -r rules/php ~/.claude/rules/ecc/
cp -r rules/ruby ~/.claude/rules/ecc/
cp -r rules/arkts ~/.claude/rules/ecc/

# Atenção ! ! ! Configure de acordo com os requisitos reais do seu projeto; a configuração aqui é apenas para referência.
```

Para regras locais do projeto, use o mesmo namespace na raiz do projeto:

```bash
mkdir -p .claude/rules/ecc
cp -r rules/common .claude/rules/ecc/
cp -r rules/typescript .claude/rules/ecc/
```

## Regras vs Skills

- **Regras** definem padrões, convenções e checklists que se aplicam amplamente (ex.: "80% de cobertura de testes", "sem segredos hardcoded").
- **Skills** (diretório `skills/`) fornecem material de referência profundo e acionável para tarefas específicas (ex.: `python-patterns`, `golang-testing`).

Os arquivos de regras específicos de linguagem referenciam as skills relevantes quando apropriado. As regras dizem *o que* fazer; as skills dizem *como* fazer.

## Adicionando uma Nova Linguagem

Para adicionar suporte a uma nova linguagem (ex.: `rust/`):

1. Crie um diretório `rules/rust/`
2. Adicione arquivos que estendam as regras common:
   - `coding-style.md` — ferramentas de formatação, idiomas, padrões de tratamento de erros
   - `testing.md` — framework de teste, ferramentas de cobertura, organização de testes
   - `patterns.md` — padrões de design específicos da linguagem
   - `hooks.md` — Hooks PostToolUse para formatadores, linters, verificadores de tipo
   - `security.md` — gerenciamento de segredos, ferramentas de varredura de segurança
3. Cada arquivo deve começar com:
   ```
   > This file extends [common/xxx.md](../common/xxx.md) with <Language> specific content.
   ```
4. Referencie skills existentes, se disponíveis, ou crie novas em `skills/`.

Para domínios não relacionados a linguagem, como `web/`, siga o mesmo padrão em camadas quando houver orientação específica de domínio reutilizável suficiente para justificar um conjunto de regras independente.

## Prioridade das Regras

Quando regras específicas de linguagem e regras common entram em conflito, **as regras específicas de linguagem têm precedência** (o específico sobrepõe o geral). Isso segue o padrão de configuração em camadas padrão (semelhante à especificidade do CSS ou à precedência do `.gitignore`).

- `rules/common/` define padrões universais aplicáveis a todos os projetos.
- `rules/golang/`, `rules/python/`, `rules/swift/`, `rules/php/`, `rules/typescript/`, etc. sobrepõem esses padrões onde os idiomas da linguagem diferem.

### Exemplo

`common/coding-style.md` recomenda imutabilidade como princípio padrão. Um `golang/coding-style.md` específico de linguagem pode sobrepor isso:

> Go idiomático usa receivers de ponteiro para mutação de struct — veja [common/coding-style.md](../common/coding-style.md) para o princípio geral, mas a mutação idiomática de Go é preferida aqui.

### Regras common com notas de sobreposição

As regras em `rules/common/` que podem ser sobrepostas por arquivos específicos de linguagem são marcadas com:

> **Nota de linguagem**: Esta regra pode ser sobreposta por regras específicas de linguagem para linguagens onde este padrão não é idiomático.
