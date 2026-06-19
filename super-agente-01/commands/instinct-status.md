---
name: instinct-status
description: Mostra os instintos aprendidos (projeto + global) com confiança
command: true
---

# Comando Instinct Status

Mostra os instintos aprendidos para o projeto atual mais os instintos globais, agrupados por domínio.

## Implementação

Execute a CLI de instintos, resolvendo a raiz ativa do plugin ECC da mesma forma
que `hooks/hooks.json` e os outros comandos de barra (`/sessions`, `/skill-health`)
fazem — variável de ambiente → instalação padrão → raízes de plugin conhecidas → cache de plugin → fallback.
Isso evita a divergência que ocorre quando `CLAUDE_PLUGIN_ROOT` não está definido
enquanto um diretório legado `~/.claude/skills/continuous-learning-v2/` ainda
existe (#2037).

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplaces','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplaces','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
python3 "$ECC_ROOT/skills/continuous-learning-v2/scripts/instinct-cli.py" status
```

## Usage

```
/instinct-status
```

## O Que Fazer

1. Detectar o contexto do projeto atual (hash de remote/caminho do git)
2. Ler os instintos do projeto em `~/.claude/homunculus/projects/<project-id>/instincts/`
3. Ler os instintos globais em `~/.claude/homunculus/instincts/`
4. Mesclar com regras de precedência (o projeto sobrepõe o global quando os IDs colidem)
5. Exibir agrupados por domínio com barras de confiança e estatísticas de observação

## Formato de Saída

```
============================================================
  INSTINCT STATUS - 12 total
============================================================

  Projeto: my-app (a1b2c3d4e5f6)
  Instintos do projeto: 8
  Instintos globais:  4

## ESCOPO DE PROJETO (my-app)
  ### WORKFLOW (3)
    ███████░░░  70%  grep-before-edit [project]
              trigger: ao modificar código

## GLOBAL (aplica-se a todos os projetos)
  ### SECURITY (2)
    █████████░  85%  validate-user-input [global]
              trigger: ao tratar entrada do usuário
```
