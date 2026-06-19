# Guia do Adaptador JoyCode

O JoyCode pode consumir o ECC por meio do instalador seletivo. O adaptador instala comandos, agents, skills e regras niveladas compartilhadas do ECC em um diretório `.joycode/` local do projeto.

## Instalação

Visualize o plano de instalação:

```bash
node scripts/install-plan.js --target joycode --profile full
```

Aplique-o ao projeto atual:

```bash
node scripts/install-apply.js --target joycode --profile full
```

Para uma instalação menor, selecione módulos explicitamente:

```bash
node scripts/install-apply.js --target joycode --modules rules-core,commands-core,workflow-quality
```

## Layout

O adaptador de projeto grava arquivos gerenciados em:

```text
.joycode/
  agents/
  commands/
  rules/
  skills/
  mcp-configs/
  scripts/
  ecc-install-state.json
```

As regras são niveladas em nomes de arquivos com namespace para que um projeto JoyCode não receba diretórios de regras aninhados como `rules/common/coding-style.md`. Comandos, agents e skills mantêm a mesma estrutura que usam em outros lugares no ECC.
O perfil completo também inclui arquivos MCP compartilhados e auxiliares de configuração que outros adaptadores locais de projeto do ECC utilizam.

## Desinstalação

Use o caminho de desinstalação gerenciada do ECC em vez de excluir arquivos manualmente:

```bash
node scripts/uninstall.js --target joycode
```

O comando de desinstalação lê `.joycode/ecc-install-state.json` e remove apenas os arquivos que o ECC instalou. Arquivos JoyCode criados pelo usuário são preservados.

## PR de Origem

Este adaptador recupera a intenção útil do JoyCode local de projeto do PR obsoleto #1429, substituindo o instalador de shell independente pela maquinaria atual de estado de instalação e desinstalação do ECC.
