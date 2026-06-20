---
name: safety-guard
description: Use esta skill para prevenir operações destrutivas ao trabalhar em sistemas de produção ou executar agents de forma autônoma.
metadata:
  origin: ECC
---

# Safety Guard — Prevenir Operações Destrutivas

## Quando Usar

- Ao trabalhar em sistemas de produção
- Quando agents estão executando de forma autônoma (modo totalmente automático)
- Quando você quer restringir edições a um diretório específico
- Durante operações sensíveis (migrações, deploys, alterações de dados)

## Como Funciona

Três modos de proteção:

### Modo 1: Careful Mode (Modo Cuidadoso)

Intercepta comandos destrutivos antes da execução e emite avisos:

```
Padrões monitorados:
- rm -rf (especialmente /, ~, ou raiz do projeto)
- git push --force
- git reset --hard
- git checkout . (descartar todas as alterações)
- DROP TABLE / DROP DATABASE
- docker system prune
- kubectl delete
- chmod 777
- sudo rm
- npm publish (publicações acidentais)
- Qualquer comando com --no-verify
```

Quando detectado: mostra o que o comando faz, solicita confirmação, sugere alternativa mais segura.

### Modo 2: Freeze Mode (Modo Congelado)

Bloqueia edições de arquivo em uma árvore de diretório específica:

```
/safety-guard freeze src/components/
```

Qualquer Write/Edit fora de `src/components/` é bloqueado com uma explicação. Útil quando você quer que um agent se concentre em uma área sem tocar em código não relacionado.

### Modo 3: Guard Mode (Modo Guarda — Careful + Freeze combinados)

Ambas as proteções ativas. Segurança máxima para agents autônomos.

```
/safety-guard guard --dir src/api/ --allow-read-all
```

Agents podem ler qualquer coisa, mas só podem escrever em `src/api/`. Comandos destrutivos são bloqueados em qualquer lugar.

### Desativar

```
/safety-guard off
```

## Implementação

Usa hooks PreToolUse para interceptar chamadas de ferramentas Bash, Write, Edit e MultiEdit. Verifica o comando/caminho contra as regras ativas antes de permitir a execução.

## Integração

- Ative por padrão para sessões `codex -a never`
- Combine com pontuação de risco de observabilidade no ECC 2.0
- Registra todas as ações bloqueadas em `~/.claude/safety-guard.log`
