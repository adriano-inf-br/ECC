---
description: Navigate ECC's current agents, skills, commands, hooks, install profiles, and docs from the live repository surface.
---

# /ecc-guide

Use este comando como um mapa conversacional do Everything Claude Code. Ele deve ajudar o usuário a descobrir a superfície correta do ECC para sua tarefa sem despejar o README inteiro ou contagens de catálogo desatualizadas.

## Uso

```text
/ecc-guide
/ecc-guide setup
/ecc-guide skills
/ecc-guide commands
/ecc-guide hooks
/ecc-guide install
/ecc-guide find: <query>
/ecc-guide <feature-or-file-name>
```

## Regras de Operação

1. Leia os arquivos atuais do repositório antes de responder quando o checkout estiver disponível.
2. Prefira dados atuais do sistema de arquivos/catálogo a contagens hardcoded.
3. Mantenha a primeira resposta curta, depois ofereça caminhos específicos de aprofundamento.
4. Direcione os usuários a arquivos canônicos em vez de copiar seções longas.
5. Não invente comandos, skills, agents ou perfis de instalação que não existam.

## O Que Inspecionar

Use estes arquivos como o mapa canônico:

- `README.md` para caminhos de instalação, orientação de reset/desinstalação e posicionamento de alto nível
- `AGENTS.md` para orientação de contribuição e estrutura do projeto
- `agent.yaml` para a superfície exportada de agent e comando
- `commands/` para os shims de slash-command mantidos
- `skills/*/SKILL.md` para fluxos de trabalho reutilizáveis de skill
- `agents/*.md` para papéis de agent delegados
- `hooks/README.md` e `hooks/hooks.json` para o comportamento dos hooks
- `manifests/install-*.json` para módulos, componentes e perfis de instalação seletiva
- `scripts/ci/catalog.js --json` para contagens de catálogo ao vivo quando executado dentro do ECC

## Padrões de Resposta

### Sem Argumentos

Apresente um menu compacto:

- setup e instalação
- escolha de skills
- shims de compatibilidade de comando
- agents e delegação
- hooks e segurança
- solução de problemas de uma instalação
- encontrar uma feature específica

Depois pergunte o que ele quer fazer em seguida.

### Consulta por Tópico

Para tópicos como `skills`, `commands`, `hooks`, `install` ou `agents`:

1. Resuma a superfície atual em 3-6 bullets.
2. Aponte para os diretórios/arquivos canônicos.
3. Sugira um ou dois comandos que possam verificar o estado.
4. Evite listas exaustivas a menos que o usuário peça uma.

### Modo de Busca

Para `find: <query>`:

1. Pesquise os arquivos relevantes com `rg`.
2. Agrupe os resultados por superfície: skills, commands, agents, rules, docs, hooks.
3. Retorne primeiro as correspondências mais fortes com os caminhos de arquivo.
4. Recomende a próxima ação para cada correspondência.

### Consulta de Feature

Para um nome específico de feature:

1. Verifique primeiro os caminhos exatos, como `skills/<name>/SKILL.md`, `commands/<name>.md` e `agents/<name>.md`.
2. Se a busca exata falhar, pesquise com `rg`.
3. Explique o que a feature faz, quando usá-la e qual arquivo é o canônico.
4. Mencione features adjacentes apenas quando reduzirem a confusão.

## Comandos Relacionados

- `/project-init` para onboarding do ECC consciente da stack em um projeto-alvo
- `/harness-audit` para pontuação determinística de prontidão do repositório
- `/skill-health` para checagens de qualidade de skill
- `/skill-create` para extrair uma nova skill do histórico local do git
- `/security-scan` para revisão de segurança de configuração do Claude/OpenCode
