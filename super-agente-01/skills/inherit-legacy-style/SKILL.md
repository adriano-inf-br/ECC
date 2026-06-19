---
name: inherit-legacy-style
description: Skill de herança de estilo para projetos legados. Use quando o usuário digitar /inherit-legacy-style, ou ao integrar um agente de codificação de IA a um projeto legado escrito à mão e for preciso evitar "desvio de estilo" (o modelo impondo seus idiomas mainstream pré-treinados ao projeto). Independente de linguagem e framework — alinha apenas a meta-arquitetura, não a sintaxe. Uma vez executada, torna-se uma restrição comportamental sobre todas as tarefas de codificação subsequentes. NÃO use para pesquisa pura ou perguntas pontuais não relacionadas ao alinhamento de estilo de código.
metadata:
  origin: community
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, AskUserQuestion
---

# Inherit Legacy Style

Evita o desvio de estilo de código por IA em projetos legados ao varrer a base de código em busca de convenções implícitas em 4 dimensões de meta-arquitetura, resolvendo conflitos com o usuário um de cada vez, e cristalizando o consenso em um `.ai-style-rules.md` aplicável. Totalmente independente de linguagem e framework.

## Quando Ativar

- O usuário digita `/inherit-legacy-style`
- O usuário menciona integrar IA a um projeto legado escrito à mão
- O usuário está preocupado com código gerado por IA "desviando" das convenções existentes do projeto
- O usuário quer extrair e codificar as regras de codificação implícitas do projeto

## When to Use

Use esta skill quando precisar preservar o estilo de um projeto legado e evitar o desvio de estilo gerado por IA. Veja **Quando Ativar** acima para as condições de gatilho.

## Pré-requisitos

- Git (recomendado; projetos sem Git recorrem aos timestamps de arquivo para o modo incremental)
- Acesso de leitura/escrita à raiz do projeto (gera `.ai-style-rules.md` e, opcionalmente, `CLAUDE.md`)

## Fluxo de trabalho

### Passo 0 — Detecção Automática de Modo

Verifique silenciosamente a existência de `.ai-style-rules.md` na raiz do projeto:

| Arquivo existe? | Modo |
|---|---|
| Não | **Branch A — Varredura Completa Inicial** |
| Sim | **Branch B — Inspeção Incremental** |

Anuncie o modo em uma linha e prossiga — nunca peça ao usuário para escolher.

### Branch A — Varredura Completa Inicial

**1. Meça a escala, escolha um nível de varredura**

```bash
git ls-files | grep -cE '\.(js|ts|jsx|tsx|vue|py|go|rs|java|kt|rb|php|cs|swift|c|cpp|h)$'
```

| Nível | Arquivos-fonte | Estratégia |
|---|---|---|
| Pequeno | ≲ 50 | Leitura atenta completa de cada fonte |
| Médio | 50–500 | Camada de infra = leitura completa; camada de negócio = amostra de 2–3 por dimensão |
| Grande | ≳ 500 | Amostragem rigorosa + limite de orçamento; resumo `--stat` primeiro, depois leituras direcionadas |

**2. Varra ao longo de 4 dimensões**

1. **Anatomia do Arquivo** — ordem de declaração dentro do arquivo (imports → tipos → lógica principal → helpers → export)
2. **Estado e Fluxo de Controle** — convenções de nomenclatura para estado assíncrono, paginação, flags
3. **Infraestrutura** — onde residem os utilitários transversais (interceptors, formatters, middleware)
4. **Tratamento de Erros** — try/catch vs interceptor global vs retorno de Result; hábitos de verificação de null

**3. Aplique a redução de ruído por limiar de sinal**

Antes de interromper o usuário, avalie a força do sinal:

- **Sinal fraco** → auto-suprimir: minoria <5% E contagem <10 → a maioria vence, a minoria vai para os DONTs
- **Sinal forte** → questionar a fundo: divisão quase equilibrada, ou bifurcação semântica em uma dimensão central
- **Exceção de projeto pequeno**: fontes ≲50, "3 vs 2" NÃO é maioria → questione a fundo

**4. Resolva conflitos um de cada vez (Protocolo de Questionamento)**

Para cada conflito de sinal forte, apresente exatamente UMA pergunta com 4 opções:

> Evidência: `pathA` usa o estilo X, `pathB` usa o estilo Y
> AVISO: Risco: misturar ambos fratura o estilo do projeto
> Escolha: `1` seguir X  `2` seguir Y  `3` isto é evolução, atualize as regras  `4` tenho uma nova regra

Suspenda até o usuário responder, depois prossiga para o próximo conflito. Nunca empilhe perguntas.

**5. Gere `.ai-style-rules.md`** com três seções obrigatórias:
- **[Golden Files]** — caminhos de exemplos reais anotados com o que demonstram
- **[Naming & State-Control Rules]** — convenções concretas e verificáveis
- **[DONTs]** — anti-padrões que não devem se propagar

**6. Instale o hook persistente**

Pergunte ao usuário a força de imposição (use `AskUserQuestion`):

| Opção | Mecanismo |
|---|---|
| **1** Hook suave (recomendado) | Escreve a referência `@.ai-style-rules.md` no `CLAUDE.md` do projeto |
| **2** Hook rígido | Hook suave + Hook `PreToolUse[Write\|Edit\|MultiEdit]` no `settings.json` |
| **3** Sem hook | Mantém o arquivo de regras; o usuário referencia manualmente |

### Branch B — Inspeção Incremental

1. Leia o `.ai-style-rules.md` existente; se tiver uma impressão digital de commit, faça `git diff <last_hash> HEAD --stat` para localizar o delta
2. Leia as mudanças recentes do Git (`git log -3 --stat` → inspecione arquivos suspeitos sob demanda)
3. Para diffs grandes demais (>centenas de arquivos): apenas resumo `--stat` + amostre as maiores mudanças
4. Compare o novo código com as regras registradas → conflitos passam pelo Protocolo de Questionamento
5. Acrescente o log de evolução ao final de `.ai-style-rules.md` (nunca sobrescreva regras antigas)

### Imposição por Turno

Quando `.ai-style-rules.md` está no contexto (carregado via CLAUDE.md), toda tarefa de escrita de código deve abrir com uma **declaração de conformidade** na cadeia de raciocínio, nomeando o exemplo seguido e os DONTs evitados.

## How It Works

Esta skill detecta automaticamente se é uma execução inicial ou incremental pela presença de `.ai-style-rules.md`:

- **Inicial (Branch A)** — Mede a escala do projeto, varre a base de código em 4 dimensões de meta-arquitetura (Anatomia do Arquivo, Estado e Fluxo de Controle, Infraestrutura, Tratamento de Erros), aplica a redução de ruído por limiar de sinal para suprimir conflitos fracos, resolve conflitos de sinal forte um de cada vez com o usuário, gera `.ai-style-rules.md` com Golden Files / Regras de Nomenclatura / DONTs, e oferece hooks de imposição opcionais.
- **Incremental (Branch B)** — Lê as regras existentes, verifica diffs recentes do Git em busca de padrões novos ou conflitantes, executa o mesmo protocolo de questionamento um-de-cada-vez para quaisquer conflitos encontrados, e acrescenta logs de evolução sem sobrescrever as regras existentes.
- **Imposição por Turno** — Quando vinculada via `CLAUDE.md`, toda tarefa de escrita de código abre com uma declaração de conformidade nomeando o exemplo seguido e os DONTs evitados.

## Especificação de Saída

- `.ai-style-rules.md` na raiz do projeto (com impressão digital de commit + nível de escala no cabeçalho)
- Opcionalmente `CLAUDE.md` com a referência `@.ai-style-rules.md`
- Logs de evolução acrescentados como entradas `### [YYYY-MM-DD] Style Evolution Log`

## Anti-Padrões

- FALHA: NÃO pule o passo de medição de escala — amostrar um projeto de 30 arquivos o "deixa faminto"; varrer por completo um repo de 5.000 arquivos estoura
- FALHA: NÃO empilhe múltiplas perguntas de conflito de uma vez — o questionamento é estritamente um-de-cada-vez
- FALHA: NÃO sobrescreva regras antigas no modo incremental — sempre acrescente logs de evolução
- FALHA: NÃO assuma o "hook rígido" por padrão sem perguntar — a força de imposição é decisão do usuário
- FALHA: NÃO julgue a qualidade da sintaxe ou do stack tecnológico — esta skill alinha apenas a meta-arquitetura
- FALHA: NÃO copie bugs dos arquivos de exemplo — reutilize a estrutura, sinalize os defeitos

## Boas Práticas

- Anuncie o modo detectado (inicial vs incremental) e o nível de escala em uma linha antes de varrer
- Para projetos grandes, leia os resumos `--stat` primeiro, depois `Read` direcionado em arquivos suspeitos
- Deixe o limiar de sinal lidar com o ruído — uma divisão de nomenclatura de 843-vs-8 deve se auto-resolver sem interromper o usuário
- Em caso de dúvida sobre a força do sinal, incline-se a perguntar
- O hook suave do CLAUDE.md (`@.ai-style-rules.md`) costuma ser suficiente; hook rígido apenas se o usuário quiser imposição mecânica

## Skills Relacionadas

- `init` — inicializa um novo CLAUDE.md com documentação da base de código
- `code-review` — revisa diffs em busca de problemas de correção e estilo
- `simplify` — revisa o código em busca de oportunidades de reuso e simplificação

## Exemplos

1. **Integração inicial**
   - Usuário: "Ajude-me a integrar IA a esta base de código mais antiga sem mudar seu estilo."
   - Ação: Execute a varredura completa do Branch A → meça a escala → varra 4 dimensões → questione os conflitos → gere `.ai-style-rules.md` → ofereça a força do hook (suave/rígido/nenhum).

2. **Atualização incremental após mudanças na equipe**
   - Usuário: "Adicionamos um novo módulo; mantenha as regras de estilo existentes intactas."
   - Ação: Execute a inspeção incremental do Branch B → compare os deltas do Git com as regras registradas → questione quaisquer novos conflitos → acrescente o log de evolução sem sobrescrever.

3. **Impondo DONTs via CLAUDE.md**
   - Usuário: "Garanta que todo código novo permaneça consistente com as regras do projeto."
   - Ação: Hook suave instalado → `.ai-style-rules.md` carregado automaticamente a cada sessão → toda tarefa de escrita de código abre com declaração de conformidade, reutilizando padrões de exemplo e evitando os DONTs.
