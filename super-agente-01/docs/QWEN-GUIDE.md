# Guia do Adapter Qwen CLI

O ECC pode instalar suas superfícies gerenciadas de comando, agent, skill, regra e MCP no diretório home do Qwen CLI.

## Instalação

A partir da raiz do repositório ECC:

```bash
./install.sh --target qwen --profile minimal
```

Visualize uma instalação maior antes de copiar os arquivos:

```bash
./install.sh --target qwen --profile full --dry-run
```

O adapter Qwen escreve em `~/.qwen/` e registra a propriedade de arquivos gerenciados em `~/.qwen/ecc-install-state.json`.

## Layout da Instalação

A instalação gerenciada pode preencher:

```text
~/.qwen/
  QWEN.md
  agents/
  commands/
  mcp-configs/
  rules/
  skills/
  ecc-install-state.json
```

O instalador preserva o layout de origem para regras, portanto os conjuntos de regras de linguagem ficam em caminhos como `~/.qwen/rules/common/` e `~/.qwen/rules/typescript/`.

## Atualização

Execute novamente o mesmo comando de instalação após puxar atualizações do ECC. O instalador usa o arquivo de estado de instalação para atualizar os arquivos gerenciados pelo ECC sem reivindicar arquivos de usuário não relacionados em `~/.qwen/`.

## Desinstalação

Use o caminho de desinstalação gerenciado em vez de excluir todo o diretório Qwen:

```bash
node scripts/uninstall.js --target qwen
```

Isso remove os arquivos registrados em `~/.qwen/ecc-install-state.json` e deixa a configuração Qwen não relacionada intacta.

## Escopo

Este target é intencionalmente mais estreito do que o PR obsoleto #1352. Ele transporta a intenção do target de instalação Qwen sustentável para o instalador seletivo atual e evita afirmações de hook-runtime não verificadas até que o contrato de hook/evento do Qwen seja confirmado.
