# Guia de Adaptação Manual para Harnesses Não Nativos

Use este guia quando quiser o comportamento do ECC dentro de um harness que não carrega nativamente os layouts `.claude/`, `.codex/`, `.opencode/`, `.cursor/` ou `.agent/`.

Este é o caminho de fallback para ferramentas como Grok e outras interfaces no estilo chat que podem aceitar prompts de sistema, arquivos enviados ou instruções coladas, mas não podem executar as superfícies de instalação nativas do repositório diretamente.

## Quando Usar Isso

Use a adaptação manual quando o harness de destino:

- não carrega pastas do repositório automaticamente
- não suporta comandos de barra personalizados
- não suporta hooks
- não suporta ativação de skill local ao repositório
- tem acesso parcial ou nenhum ao sistema de arquivos/ferramenta

Prefira um target ECC de primeira classe sempre que um existir:

- Claude Code
- Codex
- Cursor
- OpenCode
- CodeBuddy
- Antigravity

Use este guia somente quando precisar do comportamento do ECC em um harness não nativo.

## O que Você Está Reproduzindo

Quando você adapta o ECC manualmente, está tentando preservar quatro coisas:

1. Contexto focado em vez de despejar o repositório inteiro.
2. Pistas de ativação de skill em vez de esperar que o modelo adivinhe o fluxo de trabalho.
3. Intenção de comando mesmo quando o harness não tem sistema de comandos de barra.
4. Disciplina de hook mesmo quando o harness não tem automação nativa.

Você não está tentando espelhar todos os arquivos do repositório. Você está tentando recriar o comportamento útil com o menor bundle de contexto possível.

## O Fallback Nativo do ECC

Padronize para seleção manual do próprio repositório.

Comece com apenas os arquivos de que você realmente precisa:

- uma skill de linguagem ou framework
- uma skill de fluxo de trabalho
- uma skill de domínio se a tarefa for especializada
- um agent ou comando somente se o harness se beneficiar de orquestração explícita

Bons exemplos mínimos:

- Trabalho com funcionalidades Python:
  - `skills/python-patterns/SKILL.md`
  - `skills/tdd-workflow/SKILL.md`
  - `skills/verification-loop/SKILL.md`
- Trabalho com API TypeScript:
  - `skills/backend-patterns/SKILL.md`
  - `skills/security-review/SKILL.md`
  - `skills/tdd-workflow/SKILL.md`
- Trabalho de conteúdo/outbound:
  - `skills/brand-voice/SKILL.md`
  - `skills/content-engine/SKILL.md`
  - `skills/crosspost/SKILL.md`

Se o harness suportar upload de arquivo, faça upload apenas desses arquivos.

Se o harness só suportar contexto colado, extraia as seções relevantes e cole um bundle comprimido em vez dos arquivos completos brutos.

## Empacotamento Manual de Contexto

Você não precisa de ferramentas extras para fazer isso.

Use o repositório diretamente:

```bash
cd /path/to/everything-claude-code

sed -n '1,220p' skills/tdd-workflow/SKILL.md > /tmp/ecc-context.md
printf '\n\n---\n\n' >> /tmp/ecc-context.md
sed -n '1,220p' skills/backend-patterns/SKILL.md >> /tmp/ecc-context.md
printf '\n\n---\n\n' >> /tmp/ecc-context.md
sed -n '1,220p' skills/security-review/SKILL.md >> /tmp/ecc-context.md
```

Você também pode usar `rg` para identificar as skills certas antes de empacotar:

```bash
rg -n "When to use|Use when|Trigger" skills -g 'SKILL.md'
```

Opcional: se você já usa um empacotador de repositório como `repomix`, ele pode ajudar a comprimir arquivos selecionados em um documento de handoff. É uma ferramenta de conveniência, não o caminho canônico do ECC.

## Regras de Compressão

Ao empacotar manualmente o ECC para outro harness:

- mantenha o enquadramento da tarefa
- mantenha as condições de ativação
- mantenha os passos do fluxo de trabalho
- mantenha os exemplos críticos
- remova primeiro a prosa repetitiva
- remova variantes não relacionadas por segundo
- evite colar diretórios inteiros quando uma ou duas skills são suficientes

Se você precisar de um formato de prompt mais compacto, converta as partes essenciais em um bloco estruturado compacto:

```xml
<skill name="tdd-workflow">
  <when>Nova funcionalidade, correção de bug ou refatoração que deve ser test-first.</when>
  <steps>
    <step>Escreva um teste que falha.</step>
    <step>Faça-o passar com a menor mudança.</step>
    <step>Refatore e execute a validação novamente.</step>
  </steps>
</skill>
```

## Reproduzindo Comandos

Se o harness não tem sistema de comandos de barra, defina um pequeno registro de comandos no prompt do sistema ou no preâmbulo da sessão.

Exemplo:

```text
Registro de comandos:
- /plan -> use raciocínio estilo planner, produza um plano de execução curto, depois aja
- /tdd -> siga a skill tdd-workflow
- /review -> entre no modo code-review e enumere as descobertas primeiro
- /verify -> execute um loop de verificação antes de declarar conclusão
```

Você não está implementando comandos reais. Você está dando ao harness identificadores de invocação explícitos que mapeiam para o comportamento do ECC.

## Reproduzindo Hooks

Se o harness não tem hooks nativos, mova a intenção do hook para as instruções permanentes.

Exemplo:

```text
Antes de escrever código:
1. Verifique se uma skill relevante deve ser ativada.
2. Verifique se há mudanças sensíveis à segurança.
3. Prefira testes antes da implementação quando viável.

Antes de finalizar:
1. Releia a solicitação do usuário.
2. Verifique os principais caminhos alterados.
3. Declare o que foi realmente validado e o que não foi.
```

Isso não recria automação verdadeira, mas captura a disciplina operacional do ECC.

## Matriz de Capacidade de Harness

| Capacidade | Targets ECC de Primeira Classe | Targets de Adaptação Manual |
| --- | --- | --- |
| Instalação baseada em pasta | Nativa | Não |
| Comandos de barra | Nativos | Simulados no prompt |
| Hooks | Nativos | Simulados no prompt |
| Ativação de skill | Nativa | Manual |
| Ferramentas locais ao repositório | Nativas | Depende do harness |
| Empacotamento de contexto | Opcional | Obrigatório |

## Configuração Prática no Estilo Grok

1. Escolha o menor bundle útil.
2. Empacote os arquivos de skill do ECC selecionados em um upload ou bloco colado.
3. Adicione um pequeno registro de comandos.
4. Adicione instruções permanentes de "intenção de hook".
5. Comece com uma tarefa e verifique se o harness segue o fluxo de trabalho antes de escalar.

Exemplo de preâmbulo inicial:

```text
Você está operando com um bundle ECC adaptado manualmente.

Skills ativas:
- backend-patterns
- tdd-workflow
- security-review

Registro de comandos:
- /plan
- /tdd
- /verify

Antes de escrever código, siga as instruções da skill ativa.
Antes de finalizar, verifique o que mudou e reporte quaisquer lacunas restantes.
```

## Limitações

A adaptação manual é útil, mas ainda é de segunda classe em comparação com os targets nativos.

Você perde:

- instalação e sincronização automáticas
- execução nativa de hook
- encanamento real de comando
- descoberta confiável de skill em runtime
- orquestração nativa multi-agent/worktree

Então a regra é simples:

- use adaptação manual para levar o comportamento do ECC para harnesses não nativos
- use targets nativos do ECC sempre que quiser o sistema completo

## Trabalhos Relacionados

- [Issue #1186](https://github.com/affaan-m/everything-claude-code/issues/1186)
- [Discussão #1077](https://github.com/affaan-m/everything-claude-code/discussions/1077)
- [Guia do Antigravity](./ANTIGRAVITY-GUIDE.md)
- [Solução de Problemas](./TROUBLESHOOTING.md)
