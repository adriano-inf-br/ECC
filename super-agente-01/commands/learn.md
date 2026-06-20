---
description: Extrai padrões reutilizáveis da sessão atual e os salva como skills candidatas ou orientações.
---

# /learn - Extrair Padrões Reutilizáveis

Analise a sessão atual e extraia quaisquer padrões que valham a pena salvar como skills.

## Gatilho

Execute `/learn` em qualquer ponto de uma sessão quando você tiver resolvido um problema não trivial.

## O Que Extrair

Procure por:

1. **Padrões de Resolução de Erros**
   - Qual erro ocorreu?
   - Qual foi a causa raiz?
   - O que o corrigiu?
   - Isso é reutilizável para erros similares?

2. **Técnicas de Depuração**
   - Passos de depuração não óbvios
   - Combinações de ferramentas que funcionaram
   - Padrões de diagnóstico

3. **Workarounds**
   - Peculiaridades de bibliotecas
   - Limitações de API
   - Correções específicas de versão

4. **Padrões Específicos do Projeto**
   - Convenções da base de código descobertas
   - Decisões de arquitetura tomadas
   - Padrões de integração

## Formato de Saída

Crie um arquivo de skill em `~/.claude/skills/learned/[pattern-name].md`:

```markdown
# [Nome Descritivo do Padrão]

**Extraído:** [Data]
**Contexto:** [Breve descrição de quando isto se aplica]

## Problema
[Qual problema isto resolve - seja específico]

## Solução
[O padrão/técnica/workaround]

## Exemplo
[Exemplo de código, se aplicável]

## Quando Usar
[Condições de gatilho - o que deve ativar esta skill]
```

## Processo

1. Revisar a sessão em busca de padrões extraíveis
2. Identificar o insight mais valioso/reutilizável
3. Esboçar o arquivo de skill
4. Pedir ao usuário para confirmar antes de salvar
5. Salvar em `~/.claude/skills/learned/`

## Notas

- Não extraia correções triviais (erros de digitação, erros simples de sintaxe)
- Não extraia problemas pontuais (quedas específicas de API, etc.)
- Concentre-se em padrões que vão economizar tempo em sessões futuras
- Mantenha as skills focadas - um padrão por skill
