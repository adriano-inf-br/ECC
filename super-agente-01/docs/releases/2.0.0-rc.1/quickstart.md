# Quickstart ECC v2.0.0-rc.1

Este caminho é para um novo colaborador que deseja verificar a superfície de lançamento antes de começar a trabalhar em funcionalidades.

## Clonar

```bash
git clone https://github.com/affaan-m/ECC.git
cd ECC
```

Comece a partir de um checkout limpo. Não copie estado privado do operador, exportações brutas de workspace, tokens ou arquivos Hermes locais para o repo.

## Instalar

```bash
npm ci
```

Isso instala o toolchain de validação e empacotamento baseado em Node usado pela superfície de lançamento pública.

Para instalar o pacote rc.1 a partir do npm em vez de trabalhar a partir de um checkout:

```bash
npm install ecc-universal@next
```

`next` atualmente resolve para `ecc-universal@2.0.0-rc.1`; `latest` permanece em
`1.10.0` durante a janela do candidato a lançamento.

## Verificar

```bash
node tests/run-all.js
```

Resultado esperado: todos os testes passam com zero falhas. Para verificar desvios específicos do lançamento, execute a verificação focada:

```bash
node tests/docs/ecc2-release-surface.test.js
```

Em seguida, verifique a superfície de observabilidade local:

```bash
npm run observability:ready
```

Isso executa o [gate de prontidão de observabilidade](../../architecture/observability-readiness.md)
para status de loop, rastreamentos de sessão, auditoria de harness e logs de risco de ferramenta ECC2.

## Primeira Skill

Leia `skills/hermes-imports/SKILL.md` primeiro.

Ela mostra o padrão pretendido do ECC 2.0:

- pegar um workflow repetido do operador
- remover credenciais, caminhos privados, exportações brutas de workspace e memória pessoal
- manter a forma durável do workflow
- publicar o resultado sanitizado como uma `SKILL.md` reutilizável

Não comece importando um workflow privado do Hermes integralmente. Comece destilando uma skill reutilizável.

## Trocar de Harness

Use a mesma fonte de skill entre harnesses:

- Claude Code consome o ECC através do plugin Claude e dos hooks nativos.
- Codex consome o ECC através de `AGENTS.md`, `.codex-plugin/plugin.json` e configuração de referência MCP.
- OpenCode consome o ECC através da superfície de pacote/plugin OpenCode.

A unidade portátil ainda é `skills/*/SKILL.md`. Arquivos específicos do harness devem carregar ou adaptar essa fonte, não redefinir o workflow.

## Próximos Documentos

- [Configuração do Hermes](../../HERMES-SETUP.md)
- [Arquitetura cross-harness](../../architecture/cross-harness.md)
- [Notas de lançamento](release-notes.md)
