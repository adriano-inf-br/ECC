---
name: context-budget
description: Audita o consumo da janela de contexto do Claude Code em agents, skills, servidores MCP e regras. Identifica inchaço, componentes redundantes e produz recomendações priorizadas de economia de tokens.
metadata:
  origin: ECC
---

# Context Budget

Analise a sobrecarga de tokens em todos os componentes carregados em uma sessão do Claude Code e apresente otimizações acionáveis para recuperar espaço de contexto.

## Quando Usar

- O desempenho da sessão parece lento ou a qualidade do output está degradando
- Você adicionou recentemente muitas skills, agents ou servidores MCP
- Você quer saber quanta margem de contexto você realmente tem
- Planejando adicionar mais componentes e precisa saber se há espaço
- Executando o comando `/context-budget` (esta skill o sustenta)

## Como Funciona

### Fase 1: Inventário

Escaneie todos os diretórios de componentes e estime o consumo de tokens:

**Agents** (`agents/*.md`)
- Conte linhas e tokens por arquivo (palavras × 1,3)
- Extraia o comprimento do frontmatter `description`
- Sinalize: arquivos >200 linhas (pesados), description >30 palavras (frontmatter inflado)

**Skills** (`skills/*/SKILL.md`)
- Conte tokens por SKILL.md
- Sinalize: arquivos >400 linhas
- Verifique cópias duplicadas em `.agents/skills/` — pule cópias idênticas para evitar contagem dupla

**Rules** (`rules/**/*.md`)
- Conte tokens por arquivo
- Sinalize: arquivos >100 linhas
- Detecte sobreposição de conteúdo entre arquivos de regra no mesmo módulo de linguagem

**Servidores MCP** (`.mcp.json` ou config MCP ativa)
- Conte servidores configurados e contagem total de ferramentas
- Estime sobrecarga de schema em ~500 tokens por ferramenta
- Sinalize: servidores com >20 ferramentas, servidores que encapsulam comandos CLI simples (`gh`, `git`, `npm`, `supabase`, `vercel`)

**CLAUDE.md** (nível de projeto + usuário)
- Conte tokens por arquivo na cadeia CLAUDE.md
- Sinalize: total combinado >300 linhas

### Fase 2: Classificar

Ordene cada componente em um bucket:

| Bucket | Critério | Ação |
|--------|----------|--------|
| **Sempre necessário** | Referenciado no CLAUDE.md, sustenta um comando ativo, ou corresponde ao tipo de projeto atual | Manter |
| **Às vezes necessário** | Específico de domínio (ex.: padrões de linguagem), não referenciado no CLAUDE.md | Considerar ativação sob demanda |
| **Raramente necessário** | Sem referência de comando, conteúdo sobreposto, ou sem correspondência óbvia com o projeto | Remover ou carregar preguiçosamente |

### Fase 3: Detectar Problemas

Identifique os seguintes padrões problemáticos:

- **Descriptions infladas de agents** — description >30 palavras no frontmatter carrega em cada invocação da ferramenta Task
- **Agents pesados** — arquivos >200 linhas inflam o contexto da ferramenta Task em cada spawn
- **Componentes redundantes** — skills que duplicam lógica de agent, regras que duplicam CLAUDE.md
- **Subscrição excessiva de MCP** — >10 servidores, ou servidores encapsulando ferramentas CLI disponíveis gratuitamente
- **Inchaço do CLAUDE.md** — explicações verbosas, seções desatualizadas, instruções que deveriam ser regras

### Fase 4: Relatório

Produza o relatório de context budget:

```
Relatório de Context Budget
═══════════════════════════════════════

Total estimado de sobrecarga: ~XX.XXX tokens
Modelo de contexto: Claude Sonnet (janela de 200K)
Contexto disponível efetivo: ~XXX.XXX tokens (XX%)

Detalhamento por Componente:
┌─────────────────┬────────┬───────────┐
│ Componente      │ Qtd    │ Tokens    │
├─────────────────┼────────┼───────────┤
│ Agents          │ N      │ ~X.XXX    │
│ Skills          │ N      │ ~X.XXX    │
│ Rules           │ N      │ ~X.XXX    │
│ Ferramentas MCP │ N      │ ~XX.XXX   │
│ CLAUDE.md       │ N      │ ~X.XXX    │
└─────────────────┴────────┴───────────┘

AVISO: Problemas Encontrados (N):
[ranqueados por economia de tokens]

Top 3 Otimizações:
1. [ação] → economiza ~X.XXX tokens
2. [ação] → economiza ~X.XXX tokens
3. [ação] → economiza ~X.XXX tokens

Economia potencial: ~XX.XXX tokens (XX% da sobrecarga atual)
```

No modo verbose, adicionalmente exiba contagens de tokens por arquivo, detalhamento linha a linha dos arquivos mais pesados, linhas redundantes específicas entre componentes sobrepostos e lista de ferramentas MCP com estimativas de tamanho de schema por ferramenta.

## Exemplos

**Auditoria básica**
```
Usuário: /context-budget
Skill: Escaneia configuração → 16 agents (12.400 tokens), 28 skills (6.200), 87 ferramentas MCP (43.500), 2 CLAUDE.md (1.200)
       Sinaliza: 3 agents pesados, 14 servidores MCP (3 substituíveis por CLI)
       Maior economia: remover 3 servidores MCP → -27.500 tokens (redução de 47% da sobrecarga)
```

**Modo verbose**
```
Usuário: /context-budget --verbose
Skill: Relatório completo + detalhamento por arquivo mostrando planner.md (213 linhas, 1.840 tokens),
       lista de ferramentas MCP com tamanhos por ferramenta, linhas de regra duplicadas lado a lado
```

**Verificação pré-expansão**
```
Usuário: Quero adicionar 5 servidores MCP a mais, há espaço?
Skill: Sobrecarga atual 33% → adicionar 5 servidores (~50 ferramentas) adicionaria ~25.000 tokens → empurra para 45% de sobrecarga
       Recomendação: remover 2 servidores substituíveis por CLI primeiro para ficar abaixo de 40%
```

## Boas Práticas

- **Estimativa de tokens**: use `palavras × 1,3` para prosa, `chars / 4` para arquivos com muito código
- **MCP é a maior alavanca**: cada schema de ferramenta custa ~500 tokens; um servidor com 30 ferramentas custa mais do que todas as suas skills combinadas
- **Descriptions de agents são sempre carregadas**: mesmo se o agent nunca for invocado, seu campo description está presente em todo contexto da ferramenta Task
- **Modo verbose para depuração**: use quando precisar identificar os arquivos exatos que geram sobrecarga, não para auditorias regulares
- **Audite após mudanças**: execute após adicionar qualquer agent, skill ou servidor MCP para detectar o crescimento cedo
