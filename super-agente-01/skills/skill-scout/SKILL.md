---
name: skill-scout
description: Pesquise fontes de skills locais, no marketplace, no GitHub e na web antes de criar uma nova skill. Use quando o usuário quiser criar, construir, fazer fork ou encontrar uma skill para um fluxo de trabalho.
metadata:
  origin: community
---

# Skill Scout

Use esta skill antes de criar uma nova skill. O objetivo é evitar a duplicação de
trabalho existente da comunidade ou do marketplace, ao mesmo tempo em que verifica
qualquer coisa externa antes da adoção.

Fonte: resgatado de PR da comunidade obsoleto #1232 por `redminwang`.

## Quando Usar

- O usuário diz "criar uma skill", "construir uma skill", "fazer uma skill" ou "nova skill".
- O usuário pergunta "existe uma skill para X?" ou "existe uma skill que faz Y?"
- O usuário descreve um fluxo de trabalho e você está prestes a sugerir criar uma nova skill.
- O usuário quer fazer fork ou estender uma skill existente.

Se o usuário disser explicitamente para pular a busca ou criar do zero, reconheça
isso e prossiga com o fluxo de trabalho de criação solicitado.

## Como Funciona

### Passo 1 - Capturar a Intenção

Extraia:

- A tarefa que a skill deve executar.
- As condições de gatilho para usá-la.
- O domínio, tools, frameworks ou fontes de dados envolvidos.
- Três a cinco palavras-chave de busca mais sinônimos úteis.

### Passo 2 - Pesquisar Fontes Locais

Pesquise nomes de skills instaladas e do marketplace primeiro. Fontes locais são preferidas
porque já fazem parte do ambiente do usuário.

```bash
find ~/.claude/skills -maxdepth 2 -name SKILL.md 2>/dev/null | grep -iE "keyword|synonym"
find ~/.claude/plugins/marketplaces -path '*/skills/*/SKILL.md' 2>/dev/null | grep -iE "keyword|synonym"
```

Em seguida, pesquise nas descrições do frontmatter:

```bash
grep -RilE "keyword|synonym" ~/.claude/skills ~/.claude/plugins/marketplaces 2>/dev/null
```

### Passo 3 - Pesquisar Fontes Remotas

Use tools de busca no GitHub e na web disponíveis. Prefira consultas concisas:

```bash
gh search repos "claude code skill keyword" --limit 10 --sort stars
gh search code "name: keyword" --filename SKILL.md --limit 10
```

Para busca na web, use no máximo três consultas direcionadas, como:

```text
"claude code skill" keyword
"SKILL.md" keyword
"everything-claude-code" keyword
```

### Passo 4 - Avaliar Correspondências Externas

Antes de recomendar qualquer skill externa para adoção ou fork:

- Leia o frontmatter e as instruções do `SKILL.md`.
- Procure por comandos shell inesperados, escritas de arquivo, chamadas de rede, tratamento
  de credenciais ou instalações de pacotes.
- Verifique se o repositório parece mantido.
- Prefira copiar para um Branch local novo e revisar o diff a editar os originais do marketplace.

### Passo 5 - Classificar os Resultados

Classifique os candidatos por:

1. Correspondência exata de palavra-chave no nome da skill.
2. Correspondência de palavra-chave ou sinônimo na descrição.
3. Fonte local instalada ou do marketplace.
4. Fonte do GitHub mantida com atividade recente.
5. Menção apenas na web.

Limite a lista final a 10 resultados.

### Passo 6 - Apresentar as Opções de Decisão

Apresente ao usuário uma tabela curta:

| Opção | Significado |
| --- | --- |
| Usar existente | Invocar ou instalar uma skill correspondente como está. |
| Fazer fork ou estender | Copiar a skill mais próxima e modificá-la. |
| Criar nova | Construir uma nova skill após confirmar que não existe correspondência próxima. |

Crie uma nova skill somente depois que o usuário escolher esse caminho ou depois que a busca
não encontrar correspondência próxima.

## Exemplos

### Tabela de Resultados

```markdown
| # | Skill | Fonte | Por que corresponde | Lacuna |
| --- | --- | --- | --- | --- |
| 1 | article-writing | ECC Local | Elabora artigos e guias | Não focada em notas de release |
| 2 | content-engine | ECC Local | Fluxo de trabalho de conteúdo multi-formato | Mais pesada do que o necessário |
| 3 | blog-writer | GitHub | Skill de escrita de blog com commits recentes | Precisa de revisão de segurança |
```

### Resumo para o Usuário

```markdown
Encontrei duas correspondências locais próximas e um candidato externo. A correspondência
mais próxima é `article-writing`; ela cobre elaboração e revisão, mas não inclui o
checklist de notas de release que você pediu. Posso usá-la como está, fazer fork para uma
variante de notas de release ou criar uma nova skill.
```

## Anti-Padrões

- Não pule direto para criar uma nova skill quando uma busca for razoável.
- Não instale skills externas sem lê-las primeiro.
- Não apresente uma longa lista não classificada de correspondências fracas.
- Não trate menções apenas na web como fontes confiáveis.
- Não edite os originais do marketplace instalados no lugar.

## Relacionado

- `search-first` - Fluxo de trabalho geral de buscar antes de construir.
- `skill-stocktake` - Auditar skills instaladas em busca de saúde, duplicatas e lacunas.
- `agent-sort` - Categorizar e organizar agentes e skills existentes.
