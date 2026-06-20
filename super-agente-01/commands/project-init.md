---
description: Detecta a stack de um projeto e produz um plano de onboarding ECC em modo dry-run usando os manifestos de instalação e mapeamentos de stack do repositório.
---

# /project-init

Cria um plano de onboarding ECC seguro e revisável para o projeto atual. Este comando deve começar em modo dry-run e só escrever arquivos após aprovação explícita do usuário.

## Uso

```text
/project-init
/project-init --dry-run
/project-init --target claude
/project-init --target cursor
/project-init --skills continuous-learning-v2,security-review
/project-init --config ecc-install.json
```

## Regras de Segurança

1. Comece sempre em dry-run. Não modifique `CLAUDE.md`, arquivos de settings, rules, skills ou o estado de instalação até o usuário aprovar o plano concreto.
2. Preserve as orientações existentes do projeto. Se `CLAUDE.md`, `.claude/settings.local.json`, `.cursor/`, `.codex/`, `.gemini/`, `.opencode/`, `.codebuddy/`, `.joycode/` ou `.qwen/` já existir, inspecione-o e proponha um plano de merge/append em vez de sobrescrever.
3. Use as ferramentas de installer e de manifesto do ECC. Não copie arquivos manualmente nem clone remotos arbitrários como atalho de instalação.
4. Mantenha as permissões restritas. Quaisquer settings gerados devem corresponder às ferramentas de build/test/lint detectadas e evitar acesso amplo ao shell.
5. Reporte exatamente o que mudaria antes de aplicar qualquer coisa.

## Entradas de Detecção

Leia a raiz do projeto atual e detecte sinais de stack a partir de:

- arquivos de gerenciador de pacotes: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`
- manifestos de linguagem: `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle`, `build.gradle.kts`
- arquivos de framework: `next.config.*`, `vite.config.*`, `tailwind.config.*`, `Dockerfile`, `docker-compose.yml`
- config do ECC: `ecc-install.json`
- mapa de stack opcional: `config/project-stack-mappings.json` no repositório ECC

Quando o checkout do ECC estiver disponível, use `config/project-stack-mappings.json` como a referência de stack-para-rules/skills. Se o arquivo estiver indisponível, recorra aos manifestos ECC instalados e às escolhas explícitas do usuário.

## Fluxo de Planejamento

1. Identifique o harness alvo. Use `claude` por padrão, a menos que o usuário peça `cursor`, `codex`, `gemini`, `opencode`, `codebuddy`, `joycode` ou `qwen`.
2. Detecte as stacks a partir dos arquivos do projeto e mostre a evidência de cada correspondência.
3. Resolva o menor plano ECC útil:
   - o projeto tem um `ecc-install.json`: `node scripts/install-plan.js --config ecc-install.json --json`
   - o usuário nomeou um profile: `node scripts/install-plan.js --profile <profile> --target <target> --json`
   - o usuário nomeou skills: `node scripts/install-plan.js --skills <skill-ids> --target <target> --json`
   - apenas stacks de linguagem foram detectadas: use o dry-run de instalação de linguagem legado com esses nomes de linguagem
4. Rode um comando de apply em dry-run antes de escrever:

```bash
node scripts/install-apply.js --target <target> --dry-run --json <language-or-profile-args>
```

5. Resuma as stacks detectadas, os módulos/componentes/skills selecionados, os caminhos alvo, os módulos não suportados ignorados e os arquivos que seriam alterados.
6. Peça aprovação antes de aplicar o comando que não é dry-run.

## Contrato de Saída

Retorne:

1. evidência da stack detectada
2. harness alvo proposto
3. comando dry-run exato utilizado
4. comando de apply exato a rodar após a aprovação
5. arquivos/diretórios que seriam criados ou alterados
6. avisos sobre arquivos existentes, permissões amplas, scripts ausentes ou alvos não suportados

## Orientações para o CLAUDE.md

Se o usuário quiser um `CLAUDE.md` inicial, gere-o separadamente do plano do installer e mantenha-o mínimo:

- comando de build, se detectado
- comando de test, se detectado
- comando de lint/typecheck, se detectado
- comando de servidor de dev, se detectado
- notas específicas do repositório a partir dos scripts de package ou manifestos existentes

Nunca substitua um `CLAUDE.md` existente sem mostrar um diff e receber aprovação.

## Relacionados

- `config/project-stack-mappings.json` para dicas de stack-para-surface
- `scripts/install-plan.js` para resolução determinística de plano
- `scripts/install-apply.js` para operações de dry-run e apply
- `/ecc-guide` para descoberta interativa de funcionalidades antes de instalar
