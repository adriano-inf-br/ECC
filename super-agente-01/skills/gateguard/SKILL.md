---
name: gateguard
description: Gate de forçamento de fatos que bloqueia Edit/Write/Bash (incluindo MultiEdit) e exige investigação concreta (importadores, esquemas de dados, instrução do usuário) antes de permitir a ação. Melhora mensuravelmente a qualidade da saída em +2,25 pontos em relação a agents sem gate.
metadata:
  origin: community
---

# GateGuard — Gate de Pré-Ação para Forçamento de Fatos

Um hook PreToolUse que força o Claude a investigar antes de editar. Em vez de autoavaliação ("você tem certeza?"), ele exige fatos concretos. O próprio ato de investigar cria uma consciência que a autoavaliação nunca criou.

## Quando Ativar

- Trabalhar em qualquer codebase em que edições de arquivos afetem múltiplos módulos
- Projetos com arquivos de dados que possuem esquemas ou formatos de data específicos
- Equipes em que o código gerado por IA precisa corresponder aos padrões existentes
- Qualquer fluxo de trabalho em que o Claude tende a adivinhar em vez de investigar

## Conceito Central

A autoavaliação de LLM não funciona. Pergunte "você violou alguma política?" e a resposta é sempre "não". Isso foi verificado experimentalmente.

Mas pedir "liste cada arquivo que importa este módulo" força o LLM a executar Grep e Read. A própria investigação cria contexto que muda a saída.

**Gate de três estágios:**

```
1. DENY  — block the first Edit/Write/Bash attempt
2. FORCE — tell the model exactly which facts to gather
3. ALLOW — permit retry after facts are presented
```

Nenhum concorrente faz os três. A maioria para no deny.

## Evidência

Dois testes A/B independentes, agents idênticos, mesma tarefa:

| Tarefa | Com gate | Sem gate | Diferença |
| --- | --- | --- | --- |
| Módulo de analytics | 8.0/10 | 6.5/10 | +1.5 |
| Validador de webhook | 10.0/10 | 7.0/10 | +3.0 |
| **Média** | **9.0** | **6.75** | **+2.25** |

Ambos os agents produzem código que roda e passa nos testes. A diferença está na profundidade do design.

## Tipos de Gate

### Gate de Edit / MultiEdit (primeira edição por arquivo)

O MultiEdit é tratado de forma idêntica — cada arquivo do lote tem o gate aplicado individualmente.

```
Before editing {file_path}, present these facts:

1. List ALL files that import/require this file (use Grep)
2. List the public functions/classes affected by this change
3. If this file reads/writes data files, show field names, structure,
   and date format (use redacted or synthetic values, not raw production data)
4. Quote the user's current instruction verbatim
```

### Gate de Write (primeira criação de arquivo novo)

```
Before creating {file_path}, present these facts:

1. Name the file(s) and line(s) that will call this new file
2. Confirm no existing file serves the same purpose (use Glob)
3. If this file reads/writes data files, show field names, structure,
   and date format (use redacted or synthetic values, not raw production data)
4. Quote the user's current instruction verbatim
```

### Gate de Bash Destrutivo (todo comando destrutivo)

Dispara em: `rm -rf`, `git reset --hard`, `git push --force`, `drop table`, etc.

```
1. List all files/data this command will modify or delete
2. Write a one-line rollback procedure
3. Quote the user's current instruction verbatim
```

### Gate de Bash Rotineiro (uma vez por sessão)

```
1. The current user request in one sentence
2. What this specific command verifies or produces
```

## Início Rápido

### Opção A: Use o hook do ECC (zero instalação)

O hook em `scripts/hooks/gateguard-fact-force.js` está incluído neste plugin. Ative-o via hooks.json.

Se o GateGuard bloquear trabalho de configuração ou reparo, inicie a sessão com
`ECC_GATEGUARD=off`. Para controle no nível do hook, continue usando
`ECC_DISABLED_HOOKS` com o ID do hook do GateGuard.

Em sessões longas, apenas as primeiras `GATEGUARD_FACT_FORCE_FULL_DENIALS`
negações de forçamento de fatos (padrão 3) emitem o bloco completo de quatro fatos; negações
posteriores são condensadas em uma única linha contendo o número ordinal da negação, de modo que
blocos quase idênticos não acumulem na janela de contexto e
amplifiquem loops de repetição do modelo (#2142). Tentar novamente o mesmo arquivo ou
comando após apresentar os fatos nunca dispara o gate de novo.

### Opção B: Pacote completo com config

```bash
pip install gateguard-ai
gateguard init
```

Isso adiciona `.gateguard.yml` para configuração por projeto (mensagens personalizadas, caminhos ignorados, alternância de gates).

## Anti-Padrões

- **Não use autoavaliação em vez disso.** "Você tem certeza?" sempre recebe "sim". Isso é verificado experimentalmente.
- **Não pule a verificação de esquema de dados.** Ambos os agents do teste A/B assumiram datas ISO-8601 quando os dados reais usavam `%Y/%m/%d %H:%M`. Verificar a estrutura dos dados (com valores redigidos) previne toda essa classe de bugs.
- **Não aplique gate a cada comando Bash.** Gates de bash rotineiro acontecem uma vez por sessão. Gates de bash destrutivo acontecem toda vez. Esse equilíbrio evita lentidão enquanto captura riscos reais.

## Melhores Práticas

- Deixe o gate disparar naturalmente. Não tente responder às perguntas do gate antecipadamente — a própria investigação é o que melhora a qualidade.
- Personalize as mensagens do gate para o seu domínio. Se o seu projeto tem convenções específicas, adicione-as aos prompts do gate.
- Use `.gateguard.yml` para ignorar caminhos como `.venv/`, `node_modules/`, `.git/`.

## Skills Relacionadas

- `safety-guard` — Verificações de segurança em tempo de execução (complementar, não sobreposta)
- `code-reviewer` — Revisão pós-edição (o GateGuard é investigação pré-edição)
